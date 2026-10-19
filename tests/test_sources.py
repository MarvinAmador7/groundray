"""Source artifacts preserve originals, version scope and explicit mutation boundaries."""

from __future__ import annotations

import hashlib
import json
import subprocess
from datetime import UTC, datetime
from pathlib import Path

import pytest
from typer.testing import CliRunner

from groundray.authoring import (
    ConfidenceLevel,
    GenerationMethod,
    KnowledgeType,
    plan_knowledge_create,
    save_knowledge_create,
)
from groundray.brains import (
    BrainError,
    add_brain,
    init_brain,
    load_catalog,
    sync_brain,
    use_brain,
)
from groundray.cli import app
from groundray.search import SearchError
from groundray.settings import Settings, save_settings
from groundray.sources import (
    CAPTURE_ATTRIBUTES,
    MAX_SOURCE_BYTES,
    SourceError,
    get_source,
    plan_source_capture,
    save_source_capture,
)

TODAY = datetime.now(UTC).date().isoformat()
runner = CliRunner()


def git(repository: Path, *args: str) -> bytes:
    return subprocess.check_output(
        [
            "git",
            "-c",
            "core.hooksPath=/dev/null",
            "-c",
            "user.name=Fixture process",
            "-c",
            "user.email=fixture@localhost.invalid",
            "-C",
            str(repository),
            *args,
        ]
    )


@pytest.fixture
def company(tmp_path: Path):
    settings = Settings(data_dir=tmp_path / "data", cache_dir=tmp_path / "cache")
    repository = tmp_path / "company"
    init_brain(str(repository), "Source fixture company", "company", settings, as_of=TODAY)
    original = tmp_path / "Original record.md"
    original.write_bytes(b"---\r\nx-vendor: {unfamiliar: true}\r\n---\r\n# Metric\r\nFees 4000\r\n")
    return settings, repository, original


def capture(company, **kwargs):
    settings, _repository, original = company
    plan = plan_source_capture(settings, original, actor="openai/codex", as_of=TODAY, **kwargs)
    return plan, save_source_capture(settings, plan, as_of=TODAY)


def test_plan_is_read_only_and_save_preserves_bytes_receipt_and_unknown_metadata(company):
    settings, repository, original = company
    before = git(repository, "rev-parse", "HEAD")
    catalog = load_catalog(settings)
    plan = plan_source_capture(
        settings, original, actor="openai/codex", origin="Supplied synthetic record", as_of=TODAY
    )
    assert git(repository, "rev-parse", "HEAD") == before
    assert not git(repository, "status", "--porcelain")
    assert load_catalog(settings) == catalog
    assert not (repository / "knowledge" / plan.path).exists()
    result = save_source_capture(settings, plan, as_of=TODAY)
    assert result["applied"] and result["active_brain_updated"] and result["needs_reindex"]
    assert result["capture"]["original_name"] == "Original record.md"
    assert result["capture"]["captured"]["by"] == "openai/codex"
    assert "generated" not in result["capture"] and "verified" not in result["capture"]
    read = get_source(settings, plan.path, slug="company", as_of=TODAY)
    assert read["source"]["content"].encode() == original.read_bytes()
    assert read["source"]["sha256"] == hashlib.sha256(original.read_bytes()).hexdigest()
    assert read["capture_receipt"]["origin"] == "Supplied synthetic record"
    assert read["citation"]["commit"] == result["saved_version"]
    assert read["context_citation"] is None
    assert not git(repository, "status", "--porcelain")


def test_crlf_survives_autocrlf_and_configured_filter_is_not_executed(company, tmp_path):
    settings, repository, original = company
    marker = tmp_path / "filter-executed"
    (repository / ".gitattributes").write_text(
        "knowledge/references/captures/** text filter=source-fixture\n"
    )
    git(repository, "add", ".gitattributes")
    git(repository, "commit", "-m", "Seed synthetic Git attributes")
    git(repository, "config", "core.autocrlf", "true")
    git(repository, "config", "filter.source-fixture.clean", f"touch {marker}; cat")
    git(repository, "config", "filter.source-fixture.smudge", f"touch {marker}; cat")
    sync_brain(settings, "company", as_of=TODAY)
    plan, result = capture(company)
    assert not marker.exists()
    assert (
        git(repository, "cat-file", "blob", f"{result['saved_version']}:knowledge/{plan.path}")
        == original.read_bytes()
    )
    assert (
        get_source(settings, plan.path, as_of=TODAY)["source"]["content"].encode()
        == original.read_bytes()
    )


def test_high_precedence_attributes_refuse_and_rollback_without_running_filter(company, tmp_path):
    settings, repository, original = company
    old_head = git(repository, "rev-parse", "HEAD")
    log = (repository / "knowledge/log.md").read_bytes()
    marker = tmp_path / "filter-executed"
    git(repository, "config", "filter.source-fixture.clean", f"touch {marker}; cat")
    (repository / ".git/info/attributes").write_text(
        "knowledge/references/captures/** filter=source-fixture\n"
    )
    plan = plan_source_capture(settings, original, as_of=TODAY)
    with pytest.raises(SourceError, match="would transform"):
        save_source_capture(settings, plan, as_of=TODAY)
    assert not marker.exists()
    assert git(repository, "rev-parse", "HEAD") == old_head
    assert not git(repository, "status", "--porcelain")
    assert (repository / "knowledge/log.md").read_bytes() == log
    assert not (repository / "knowledge/references/captures").exists()


def test_commit_failure_rolls_back_exact_owned_files_and_index(company, monkeypatch):
    settings, repository, original = company
    before = git(repository, "rev-parse", "HEAD")
    log = (repository / "knowledge/log.md").read_bytes()
    plan = plan_source_capture(settings, original, as_of=TODAY)

    def fail(*args, **kwargs):
        git(repository, "add", "knowledge")
        raise OSError("simulated commit failure")

    monkeypatch.setattr("groundray.sources.commit_authoring_changes", fail)
    with pytest.raises(OSError, match="simulated"):
        save_source_capture(settings, plan, as_of=TODAY)
    assert git(repository, "rev-parse", "HEAD") == before
    assert not git(repository, "status", "--porcelain")
    assert (repository / "knowledge/log.md").read_bytes() == log


def test_refresh_failure_keeps_local_commit_and_prior_install(company, monkeypatch):
    settings, repository, original = company
    previous = load_catalog(settings).get("company").commit
    plan = plan_source_capture(settings, original, as_of=TODAY)

    def fail(*args, **kwargs):
        raise OSError("simulated activation failure")

    monkeypatch.setattr("groundray.sources.refresh_brain_from_authoring", fail)
    with pytest.raises(SourceError, match="saved locally at"):
        save_source_capture(settings, plan, as_of=TODAY)
    assert load_catalog(settings).get("company").commit == previous
    assert git(repository, "rev-parse", "HEAD").decode().strip() != previous
    assert (repository / "knowledge" / plan.path).read_bytes() == original.read_bytes()
    assert not git(repository, "status", "--porcelain")


def test_declared_source_reads_legacy_and_bundle_root_resource(company):
    settings, repository, _original = company
    plan, _result = capture(company)
    created = plan_knowledge_create(
        settings,
        item_type=KnowledgeType.CONCEPT,
        title="Recorded metric context",
        description="Scoped metric explanation cites a saved source record.",
        actor="openai/codex",
        method=GenerationMethod.AGENT_GENERATED,
        body="# Recorded metric context\n\n## Definition\n\nFees are recorded.[^raw]\n\n## Context\n\nInspect the supplied source.\n",
        sources=[
            {"id": "raw", "resource": "/" + plan.path + "#metric"},
            {
                "id": "external",
                "resource": "https://example.com/record",
                "title": "External origin",
            },
        ],
        relative_path="wiki/metric.md",
        confidence_level=ConfidenceLevel.MEDIUM,
        confidence_basis="Synthetic source, no human verification.",
        as_of=TODAY,
    )
    save_knowledge_create(settings, created, as_of=TODAY)
    read = get_source(settings, "wiki/metric.md", "raw", "company", as_of=TODAY)
    assert read["context_citation"]["item_id"] == created.as_dict(applied=False)["item_id"]
    assert read["fragment"] == "metric" and not read["fragment_validated"]
    with pytest.raises(SourceError, match="declared"):
        get_source(settings, "wiki/metric.md", "undeclared", as_of=TODAY)
    with pytest.raises(SourceError, match="external sources are not fetched"):
        get_source(settings, "wiki/metric.md", "external", as_of=TODAY)
    with pytest.raises(SourceError, match="references/captures"):
        get_source(settings, "log.md", as_of=TODAY)


def test_revisions_do_not_change_old_capture_and_reader_stays_pinned_until_sync(company, tmp_path):
    settings, repository, original = company
    first_plan, first = capture(company)
    reader = Settings(data_dir=tmp_path / "reader/data", cache_dir=tmp_path / "reader/cache")
    add_brain(str(repository), reader, as_of=TODAY)
    original.write_text("corrected fees 4500\n")
    with pytest.raises(SourceError, match="already exists"):
        plan_source_capture(settings, original, as_of=TODAY)
    second_plan, second = capture(company, destination="references/captures/record-revision-2.md")
    assert (
        get_source(reader, first_plan.path, as_of=TODAY)["citation"]["commit"]
        == first["saved_version"]
    )
    with pytest.raises(SourceError, match="missing"):
        get_source(reader, second_plan.path, as_of=TODAY)
    sync_brain(reader, "company", as_of=TODAY)
    assert (
        get_source(reader, second_plan.path, as_of=TODAY)["source"]["content"]
        == "corrected fees 4500\n"
    )
    old = get_source(reader, first_plan.path, as_of=TODAY)
    assert old["source"]["sha256"] == first["capture"]["sha256"]
    assert old["citation"]["commit"] == second["saved_version"]


@pytest.mark.parametrize(
    "destination",
    [
        "../escape.txt",
        "/references/captures/raw.txt",
        "references/raw.txt",
        "references/captures/.hidden/raw.txt",
        "references/captures/a/../raw.txt",
        "references/captures/raw*.txt",
        "references/captures/a\\b.txt",
    ],
)
def test_unsafe_destinations_are_refused(company, destination):
    settings, repository, original = company
    with pytest.raises(SourceError, match="portable lowercase path"):
        plan_source_capture(settings, original, destination=destination, as_of=TODAY)
    assert not git(repository, "status", "--porcelain")


@pytest.mark.parametrize(
    "material,message",
    [(b"\xff\xfe", "UTF-8"), (b"x\x00y", "NUL"), (b"x" * (MAX_SOURCE_BYTES + 1), "1 MiB")],
    ids=["non-utf8", "nul-byte", "over-limit"],
)
def test_unsupported_inputs_are_not_transformed(company, material, message):
    settings, _repository, original = company
    original.write_bytes(material)
    with pytest.raises(SourceError, match=message):
        plan_source_capture(settings, original, as_of=TODAY)
    assert original.read_bytes() == material


def test_symlink_and_conflicting_capture_rules_are_refused(company, tmp_path):
    settings, repository, original = company
    linked_input = tmp_path / "linked.md"
    linked_input.symlink_to(original)
    with pytest.raises(SourceError, match="symbolic link"):
        plan_source_capture(settings, linked_input, as_of=TODAY)
    root = repository / "knowledge/references"
    root.mkdir()
    root.joinpath("captures").symlink_to(tmp_path)
    git(repository, "add", "knowledge/references")
    git(repository, "commit", "-m", "Synthetic unsafe source directory")
    with pytest.raises(SourceError, match="symbolic link"):
        plan_source_capture(settings, original, as_of=TODAY)


def test_plan_never_overwrites_concurrent_destination_or_dirty_installed_source(company):
    settings, repository, original = company
    plan = plan_source_capture(settings, original, as_of=TODAY)
    target = repository / "knowledge" / plan.path
    target.parent.mkdir(parents=True)
    target.write_text("concurrent work\n")
    with pytest.raises(BrainError, match="unfinished local change"):
        save_source_capture(settings, plan, as_of=TODAY)
    assert target.read_text() == "concurrent work\n"


def test_existing_capture_attributes_are_preserved_or_refused(company):
    settings, repository, original = company
    capture_root = repository / "knowledge/references/captures"
    capture_root.mkdir(parents=True)
    rules = capture_root / ".gitattributes"
    rules.write_bytes(CAPTURE_ATTRIBUTES)
    git(repository, "add", "knowledge")
    git(repository, "commit", "-m", "Seed canonical preservation rules")
    plan = plan_source_capture(settings, original, as_of=TODAY)
    assert all(change.path != "references/captures/.gitattributes" for change in plan.changes)
    save_source_capture(settings, plan, as_of=TODAY)
    assert rules.read_bytes() == CAPTURE_ATTRIBUTES
    rules.write_text("* text=auto\n")
    git(repository, "add", "knowledge")
    git(repository, "commit", "-m", "Synthetic conflicting rules")
    with pytest.raises(SourceError, match="different Git attributes"):
        plan_source_capture(
            settings, original, destination="references/captures/another.txt", as_of=TODAY
        )
    assert rules.read_text() == "* text=auto\n"


def test_receipt_mismatch_is_not_presented_as_matching_capture(company):
    settings, repository, _original = company
    plan, _result = capture(company)
    receipt = repository / "knowledge" / (plan.path + ".capture.json")
    payload = json.loads(receipt.read_text())
    payload["sha256"] = "0" * 64
    receipt.write_text(json.dumps(payload))
    git(repository, "add", "knowledge")
    git(repository, "commit", "-m", "Synthetic invalid source receipt")
    sync_brain(settings, "company", as_of=TODAY)
    with pytest.raises(SourceError, match="does not match"):
        get_source(settings, plan.path, as_of=TODAY)


def test_dirty_installed_capture_is_not_read(company):
    settings, _repository, _original = company
    plan, _result = capture(company)
    checkout = load_catalog(settings).get("company").checkout_path(settings)
    target = checkout / "knowledge" / plan.path
    target.write_text("unfinished replacement\n")
    with pytest.raises(SearchError, match="clean, pinned"):
        get_source(settings, plan.path, as_of=TODAY)
    assert target.read_text() == "unfinished replacement\n"


@pytest.mark.parametrize(
    "material,message",
    [
        ("# Original\r\nUnknown metadata and €4000\r\n".encode(), None),
        (b"\xff\xfe", "not UTF-8"),
        (b"x" * (MAX_SOURCE_BYTES + 1), "1 MiB"),
    ],
    ids=["legacy-text", "legacy-binary", "legacy-large"],
)
def test_declared_legacy_source_reads_without_receipt_or_silent_conversion(
    company, material, message
):
    settings, repository, _original = company
    source = repository / "knowledge/references/legacy-record.txt"
    source.parent.mkdir()
    source.write_bytes(material)
    git(repository, "add", "knowledge")
    git(repository, "commit", "-m", "Seed synthetic legacy record")
    sync_brain(settings, "company", as_of=TODAY)
    plan = plan_knowledge_create(
        settings,
        item_type=KnowledgeType.CONCEPT,
        title="Legacy record context",
        description="Retains the supplied legacy source without a managed capture receipt.",
        actor="openai/codex",
        method=GenerationMethod.AGENT_GENERATED,
        body="# Legacy record context\n\n## Definition\n\nSupplied record.[^raw]\n\n## Context\n\nInspect the original.\n",
        sources=[{"id": "raw", "resource": "../references/legacy-record.txt"}],
        relative_path="wiki/legacy.md",
        confidence_level=ConfidenceLevel.MEDIUM,
        confidence_basis="Synthetic source, not authenticated.",
        as_of=TODAY,
    )
    save_knowledge_create(settings, plan, as_of=TODAY)
    if message:
        with pytest.raises(SourceError, match=message):
            get_source(settings, "wiki/legacy.md", "raw", as_of=TODAY)
    else:
        result = get_source(settings, "wiki/legacy.md", "raw", as_of=TODAY)
        assert result["capture_receipt"] is None
        assert result["source"]["content"].encode() == material


@pytest.mark.parametrize(
    "material", [None, b"not-json", b"{}"], ids=["missing", "invalid-json", "invalid-shape"]
)
def test_unusable_managed_receipt_is_reported(company, material):
    settings, repository, _original = company
    plan, _result = capture(company)
    receipt = repository / "knowledge" / (plan.path + ".capture.json")
    if material is None:
        receipt.unlink()
    else:
        receipt.write_bytes(material)
    git(repository, "add", "knowledge")
    git(repository, "commit", "-m", "Synthetic unusable receipt")
    sync_brain(settings, "company", as_of=TODAY)
    with pytest.raises(SourceError, match="receipt"):
        get_source(settings, plan.path, as_of=TODAY)


def test_changed_committed_receipt_is_detected_before_activation(company, monkeypatch):
    settings, repository, original = company
    previous = load_catalog(settings).get("company").commit
    plan = plan_source_capture(settings, original, as_of=TODAY)
    from groundray.brains import commit_authoring_changes

    def replace_receipt(*args, **kwargs):
        receipt = repository / "knowledge" / (plan.path + ".capture.json")
        value = json.loads(receipt.read_text())
        value["origin"] = "unexpected concurrent replacement"
        receipt.write_text(json.dumps(value))
        return commit_authoring_changes(*args, **kwargs)

    monkeypatch.setattr("groundray.sources.commit_authoring_changes", replace_receipt)
    with pytest.raises(SourceError, match="planned capture/receipt bytes"):
        save_source_capture(settings, plan, as_of=TODAY)
    assert load_catalog(settings).get("company").commit == previous
    assert (
        "unexpected concurrent replacement"
        in (repository / "knowledge" / (plan.path + ".capture.json")).read_text()
    )


def test_cli_capture_plan_apply_get_and_scoped_actions(company, tmp_path):
    settings, repository, original = company
    config = tmp_path / "config.yaml"
    save_settings(settings, config)
    args = [
        "source",
        "capture",
        str(original),
        "--actor",
        "openai/codex",
        "--brain",
        "company",
        "--config",
        str(config),
        "--as-of",
        TODAY,
        "--json",
    ]
    preview = runner.invoke(app, args)
    assert preview.exit_code == 0, preview.output
    assert not json.loads(preview.output)["applied"]
    assert not git(repository, "status", "--porcelain")
    saved = runner.invoke(app, [*args, "--apply"])
    assert saved.exit_code == 0, saved.output
    payload = json.loads(saved.output)
    read = runner.invoke(app, payload["get_command"][1:])
    assert read.exit_code == 0, read.output
    assert json.loads(read.output)["source"]["content"].encode() == original.read_bytes()
    assert "--config" in payload["reindex_command"] and "--as-of" in payload["reindex_command"]
    refusal = runner.invoke(app, [*args, "--apply"])
    assert refusal.exit_code == 1 and "already exists" in refusal.output


@pytest.mark.parametrize("actor", ["human:a", "unscoped-person", "openai/codex\nforged"])
def test_capture_actor_uses_existing_profile_syntax(company, actor):
    settings, repository, original = company
    with pytest.raises(SourceError, match="actor"):
        plan_source_capture(settings, original, actor=actor, as_of=TODAY)
    assert not git(repository, "status", "--porcelain")


def test_named_company_capture_keeps_active_selection_and_other_brain_unchanged(company, tmp_path):
    settings, repository, original = company
    init_brain(
        str(tmp_path / "other-company"), "Other fixture company", "other", settings, as_of=TODAY
    )
    use_brain("company", settings)
    original_commit = load_catalog(settings).get("company").commit
    plan = plan_source_capture(settings, original, slug="other", as_of=TODAY)
    saved = save_source_capture(settings, plan, as_of=TODAY)
    catalog = load_catalog(settings)
    assert catalog.active == "company" and catalog.get("company").commit == original_commit
    assert saved["citation"]["brain_slug"] == "other"
    assert not (repository / "knowledge" / plan.path).exists()
    assert (
        get_source(settings, plan.path, slug="other", as_of=TODAY)["source"]["content"].encode()
        == original.read_bytes()
    )
    with pytest.raises(SourceError, match="missing"):
        get_source(settings, plan.path, slug="company", as_of=TODAY)
