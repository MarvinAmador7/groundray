from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest
from typer.testing import CliRunner

from portable_kb import collaboration
from portable_kb.brains import BrainError, add_brain, load_catalog, sync_brain
from portable_kb.cli import app
from portable_kb.collaboration import (
    attach_authoring,
    propose_brain,
    publish_proposal,
    review_proposal,
)
from portable_kb.settings import Settings, save_settings
from portable_kb.sources import get_source, plan_source_capture, save_source_capture

AS_OF = "2026-10-13"
IDENTITY = "urn:uuid:11111111-1111-4111-8111-111111111111"


def git(repository: Path, *args: str) -> str:
    return subprocess.check_output(
        [
            "git",
            "-c",
            "core.hooksPath=/dev/null",
            "-c",
            "user.name=Test Process",
            "-c",
            "user.email=test@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "-C",
            str(repository),
            *args,
        ],
        text=True,
        stderr=subprocess.PIPE,
    ).strip()


@pytest.fixture
def team(tmp_path, brain_repo_factory):
    seed = brain_repo_factory("team", IDENTITY)
    remote = tmp_path / "shared.git"
    git(tmp_path, "clone", "--bare", str(seed), str(remote))
    source = remote.as_uri()
    author = tmp_path / "author-clone"
    git(tmp_path, "clone", source, str(author))
    a = Settings(data_dir=tmp_path / "a/data", cache_dir=tmp_path / "a/cache")
    b = Settings(data_dir=tmp_path / "b/data", cache_dir=tmp_path / "b/cache")
    add_brain(source, a, as_of=AS_OF)
    add_brain(source, b, as_of=AS_OF)
    return a, b, author, remote


def capture(team, tmp_path, name="record"):
    a, _b, author, _remote = team
    attach_authoring(a, author, apply=True, as_of=AS_OF)
    original = tmp_path / f"{name}.txt"
    original.write_bytes(b"Customer delivery remains conditional.\r\n")
    plan = plan_source_capture(
        a,
        original,
        destination=f"references/captures/{name}.txt",
        actor="process:test",
        as_of=AS_OF,
    )
    save_source_capture(a, plan, as_of=AS_OF)
    return load_catalog(a).get("team").commit


def test_two_employee_source_proposal_review_publish_sync(team, tmp_path):
    a, b, author, remote = team
    initial = load_catalog(b).get("team").commit
    assert load_catalog(a).get("team").authoring is None
    before = load_catalog(a)
    preview = attach_authoring(a, author, as_of=AS_OF)
    assert preview["applied"] is False and load_catalog(a) == before
    commit = capture(team, tmp_path)
    preview = propose_brain(a, "delivery-record", as_of=AS_OF)
    assert preview["proposal_commit"] == commit
    assert git(remote, "for-each-ref", "refs/heads/groundray") == ""
    proposed = propose_brain(a, "delivery-record", apply=True, as_of=AS_OF)
    assert git(remote, "rev-parse", "main") == initial
    assert proposed["business_approval_recorded"] is False
    before_b = load_catalog(b)
    review = review_proposal(b, "delivery-record", commit, as_of=AS_OF)
    assert review["base_commit"] == initial
    assert "Customer delivery remains conditional." in review["diff"]
    assert load_catalog(b) == before_b
    assert git(before_b.get("team").checkout_path(b), "rev-parse", "HEAD") == initial
    published = publish_proposal(b, "delivery-record", commit, initial, as_of=AS_OF)
    assert published["published_main"] and published["needs_sync"]
    assert published["business_approval_recorded"] is False
    assert load_catalog(b) == before_b
    sync_brain(b, as_of=AS_OF)
    saved = get_source(b, "references/captures/record.txt", as_of=AS_OF)
    assert saved["source"]["content"] == "Customer delivery remains conditional.\r\n"
    assert saved["citation"]["commit"] == commit
    assert git(remote, "show", f"{initial}:brain.yaml") == git(
        remote, "show", f"{commit}:brain.yaml"
    )
    assert git(remote, "merge-base", "--is-ancestor", initial, commit) == ""
    assert (
        git(before_b.get("team").checkout_path(b), "worktree", "list", "--porcelain").count(
            "worktree "
        )
        == 1
    )


@pytest.mark.parametrize(
    "case", ["dirty", "branch", "ahead", "identity", "origin", "nested", "symlink", "managed"]
)
def test_attachment_refuses_unsafe_clone_without_catalog_change(team, tmp_path, case):
    a, _b, author, _remote = team
    selected = author
    if case == "dirty":
        (author / "unfinished.txt").write_text("preserve")
    elif case == "branch":
        git(author, "checkout", "-b", "feature")
    elif case == "ahead":
        (author / "knowledge/new.txt").write_text("new")
        git(author, "add", ".")
        git(author, "commit", "-m", "Uninstalled version")
    elif case == "identity":
        p = author / "brain.yaml"
        p.write_text(
            p.read_text().replace(IDENTITY, "urn:uuid:22222222-2222-4222-8222-222222222222")
        )
    elif case == "origin":
        git(author, "remote", "set-url", "origin", "https://example.invalid/other.git")
    elif case == "nested":
        selected = author / "knowledge"
    elif case == "symlink":
        selected = tmp_path / "link"
        selected.symlink_to(author, target_is_directory=True)
    elif case == "managed":
        selected = load_catalog(a).get("team").checkout_path(a)
    before = load_catalog(a)
    with pytest.raises(BrainError):
        attach_authoring(a, selected, apply=True, as_of=AS_OF)
    assert load_catalog(a) == before
    if case == "dirty":
        assert (author / "unfinished.txt").read_text() == "preserve"


def test_attachment_does_not_replace_existing_clone(team, tmp_path):
    a, _b, author, remote = team
    attach_authoring(a, author, apply=True, as_of=AS_OF)
    another = tmp_path / "another"
    git(tmp_path, "clone", remote.as_uri(), str(another))
    with pytest.raises(BrainError, match="different authoring"):
        attach_authoring(a, another, apply=True, as_of=AS_OF)
    assert load_catalog(a).get("team").authoring == str(author)


def test_proposal_ref_cannot_be_replaced(team, tmp_path):
    a, b, _author, remote = team
    commit = capture(team, tmp_path)
    propose_brain(a, "revision", apply=True, as_of=AS_OF)
    with pytest.raises(BrainError, match="already exists"):
        propose_brain(a, "revision", apply=True, as_of=AS_OF)
    assert git(remote, "rev-parse", "groundray/revision") == commit
    assert load_catalog(b).get("team").commit != commit


@pytest.mark.parametrize("name", ["../main", "Main", "-x", "x/y", "x" * 65])
def test_bad_proposal_names_cannot_target_other_refs(team, name):
    a, _b, _author, _remote = team
    with pytest.raises(BrainError, match="Proposal name"):
        propose_brain(a, name, apply=True)


def test_review_refuses_moved_proposal_and_keeps_installed_pin(team, tmp_path):
    a, b, _author, remote = team
    first = capture(team, tmp_path)
    propose_brain(a, "revision", apply=True, as_of=AS_OF)
    second = capture(team, tmp_path, "newer-record")
    git(remote, "fetch", str(load_catalog(a).get("team").authoring_path()), second)
    git(remote, "update-ref", "refs/heads/groundray/revision", second)
    before = load_catalog(b)
    with pytest.raises(BrainError, match="Proposal moved"):
        review_proposal(b, "revision", first, as_of=AS_OF)
    assert load_catalog(b) == before


def test_publication_refuses_main_moved_after_review(team, tmp_path):
    a, b, _author, remote = team
    first = capture(team, tmp_path)
    propose_brain(a, "revision", apply=True, as_of=AS_OF)
    review = review_proposal(b, "revision", first, as_of=AS_OF)
    second = capture(team, tmp_path, "newer-record")
    propose_brain(a, "revision-two", apply=True, as_of=AS_OF)
    git(remote, "update-ref", "refs/heads/main", first)
    with pytest.raises(BrainError, match="main moved"):
        publish_proposal(b, "revision-two", second, review["base_commit"], as_of=AS_OF)
    assert git(remote, "rev-parse", "main") == first


def test_publication_lease_refuses_main_race_even_when_still_ancestor(team, tmp_path, monkeypatch):
    a, b, _author, remote = team
    initial = load_catalog(b).get("team").commit
    first = capture(team, tmp_path)
    second = capture(team, tmp_path, "newer-record")
    propose_brain(a, "revision", apply=True, as_of=AS_OF)
    original = collaboration._run_git

    def racing(executable, *arguments):
        if "push" in arguments:
            git(remote, "update-ref", "refs/heads/main", first)
        return original(executable, *arguments)

    monkeypatch.setattr(collaboration, "_run_git", racing)
    with pytest.raises(BrainError, match="Git operation failed"):
        publish_proposal(b, "revision", second, initial, as_of=AS_OF)
    assert git(remote, "rev-parse", "main") == first
    assert load_catalog(b).get("team").commit == initial


def test_create_only_lease_refuses_proposal_name_race(team, tmp_path, monkeypatch):
    a, _b, _author, remote = team
    initial = git(remote, "rev-parse", "main")
    capture(team, tmp_path)
    original = collaboration._run_git

    def racing(executable, *arguments):
        if "push" in arguments:
            git(remote, "update-ref", "refs/heads/groundray/raced", initial)
        return original(executable, *arguments)

    monkeypatch.setattr(collaboration, "_run_git", racing)
    with pytest.raises(BrainError):
        propose_brain(a, "raced", apply=True, as_of=AS_OF)
    assert git(remote, "rev-parse", "groundray/raced") == initial


def test_denied_publication_preserves_remote_and_reader(team, tmp_path):
    a, b, _author, remote = team
    initial = git(remote, "rev-parse", "main")
    commit = capture(team, tmp_path)
    propose_brain(a, "revision", apply=True, as_of=AS_OF)
    hook = remote / "hooks/pre-receive"
    hook.write_text("#!/bin/sh\nexit 1\n")
    hook.chmod(0o755)
    with pytest.raises(BrainError):
        publish_proposal(b, "revision", commit, initial, as_of=AS_OF)
    assert git(remote, "rev-parse", "main") == initial
    assert load_catalog(b).get("team").commit == initial


def test_review_refuses_identity_invalid_and_outside_history(team, tmp_path):
    a, b, author, remote = team
    initial = git(remote, "rev-parse", "main")
    capture(team, tmp_path)
    for case in ["outside", "identity", "invalid"]:
        git(author, "reset", "--hard", initial)
        if case == "outside":
            (author / "outside.txt").write_text("forbidden")
        elif case == "identity":
            p = author / "brain.yaml"
            p.write_text(
                p.read_text().replace(IDENTITY, "urn:uuid:22222222-2222-4222-8222-222222222222")
            )
        else:
            (author / "knowledge/broken.md").write_text("not a valid concept")
        git(author, "add", ".")
        git(author, "commit", "-m", case)
        commit = git(author, "rev-parse", "HEAD")
        git(author, "push", "origin", f"{commit}:refs/heads/groundray/{case}")
        before = load_catalog(b)
        with pytest.raises(BrainError):
            review_proposal(b, case, commit, as_of=AS_OF)
        assert load_catalog(b) == before
        assert (
            git(before.get("team").checkout_path(b), "worktree", "list", "--porcelain").count(
                "worktree "
            )
            == 1
        )


def test_cli_complete_handoff(team, tmp_path):
    a, b, author, remote = team
    runner = CliRunner()
    configs = {}
    for who, settings in [("a", a), ("b", b)]:
        path = tmp_path / f"{who}.yaml"
        save_settings(settings, path)
        configs[who] = path

    def cli(who, *arguments):
        result = runner.invoke(
            app, ["brain", *arguments, "--config", str(configs[who]), "--as-of", AS_OF, "--json"]
        )
        assert result.exit_code == 0, result.output
        return json.loads(result.output)

    assert cli("a", "attach", str(author))["applied"] is False
    cli("a", "attach", str(author), "--apply")
    commit = capture(team, tmp_path)
    proposed = cli("a", "propose", "cli-update", "--apply")
    review = cli("b", "review", "cli-update", "--commit", commit)
    assert review["base_commit"] == proposed["base_commit"]
    result = cli("b", "accept", "cli-update", "--commit", commit, "--base", review["base_commit"])
    assert result["needs_sync"]
    assert git(remote, "rev-parse", "main") == commit


def test_named_company_workflow_preserves_active_selection(team, tmp_path, brain_repo_factory):
    from portable_kb.brains import use_brain

    a, b, author, _remote = team
    other = brain_repo_factory("other-company", "urn:uuid:22222222-2222-4222-8222-222222222222")
    for settings in (a, b):
        add_brain(str(other), settings, as_of=AS_OF)
        use_brain("other-company", settings)
    before_a = load_catalog(a).get("other-company")
    before_b = load_catalog(b).get("other-company")
    attach_authoring(a, author, "team", apply=True, as_of=AS_OF)
    original = tmp_path / "scoped.txt"
    original.write_text("Only Team company evidence")
    plan = plan_source_capture(a, original, slug="team", as_of=AS_OF)
    saved = save_source_capture(a, plan, as_of=AS_OF)
    proposal = propose_brain(a, "scoped", "team", apply=True, as_of=AS_OF)
    review = review_proposal(b, "scoped", saved["saved_version"], "team", as_of=AS_OF)
    assert review["slug"] == "team"
    publish_proposal(
        b, "scoped", saved["saved_version"], proposal["base_commit"], "team", as_of=AS_OF
    )
    for settings, previous in ((a, before_a), (b, before_b)):
        assert load_catalog(settings).active == "other-company"
        assert load_catalog(settings).get("other-company") == previous


def test_proposal_refuses_divergent_published_main(team, tmp_path):
    a, _b, author, remote = team
    base = git(remote, "rev-parse", "main")
    capture(team, tmp_path)
    other = tmp_path / "colleague"
    git(tmp_path, "clone", remote.as_uri(), str(other))
    (other / "knowledge/colleague.txt").write_text("Another update")
    git(other, "add", ".")
    git(other, "commit", "-m", "Concurrent update")
    git(other, "push", "origin", "main")
    with pytest.raises(BrainError, match="newer or diverged"):
        propose_brain(a, "stale", apply=True, as_of=AS_OF)
    assert git(author, "merge-base", base, "HEAD") == base
    assert git(remote, "for-each-ref", "refs/heads/groundray") == ""


def test_attachment_catalog_failure_preserves_installed_brain(team, monkeypatch):
    a, _b, author, _remote = team
    before = load_catalog(a)

    def failed(*args):
        raise OSError("simulated disk error")

    monkeypatch.setattr(collaboration, "save_catalog", failed)
    with pytest.raises(OSError, match="simulated disk"):
        attach_authoring(a, author, apply=True, as_of=AS_OF)
    assert load_catalog(a) == before
    assert git(author, "rev-parse", "HEAD") == before.get("team").commit


def test_separate_push_url_cannot_publish_to_another_company(team, tmp_path):
    a, b, author, _remote = team
    capture(team, tmp_path)
    git(
        author, "remote", "set-url", "--push", "origin", "https://example.invalid/other-company.git"
    )
    with pytest.raises(BrainError, match="fetch/push origin"):
        propose_brain(a, "wrong-destination", apply=True, as_of=AS_OF)
    checkout = load_catalog(b).get("team").checkout_path(b)
    git(
        checkout,
        "remote",
        "set-url",
        "--push",
        "origin",
        "https://example.invalid/other-company.git",
    )
    with pytest.raises(BrainError, match="fetch/push origin"):
        review_proposal(b, "wrong-destination", load_catalog(a).get("team").commit, as_of=AS_OF)
