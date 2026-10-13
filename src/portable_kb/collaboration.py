"""Explicit authoring attachment and commit-pinned Git proposal review."""

from __future__ import annotations

import re
import shutil
import tempfile
from dataclasses import replace
from pathlib import Path
from typing import Any

from .brains import (
    COMMIT,
    BrainCatalog,
    BrainError,
    InstalledBrain,
    _git_is_ancestor,
    _normalize_source,
    _run_git,
    _verified_installed_checkout,
    authoring_repository,
    clean_repository_head,
    load_catalog,
    read_manifest,
    save_catalog,
)
from .settings import Settings
from .sources import get_source
from .validation import validate_bundle

PROPOSAL_NAME = re.compile(r"^[a-z0-9][a-z0-9-]{0,63}$")


def _selected(settings: Settings, slug: str | None) -> InstalledBrain:
    catalog = load_catalog(settings)
    selected = slug or catalog.active
    if selected is None:
        raise BrainError("No active brain. Install or select one first.")
    return catalog.get(selected)


def _git() -> str:
    git = shutil.which("git")
    if git is None:
        raise BrainError("Git is required for brain collaboration.")
    return git


def _origin(git: str, repository: Path, brain: InstalledBrain) -> None:
    for options in (("--all",), ("--push", "--all")):
        urls = _run_git(
            git, "-C", str(repository), "remote", "get-url", *options, "origin"
        ).splitlines()
        if len(urls) != 1 or _normalize_source(urls[0]) != brain.source:
            raise BrainError(
                "Repository fetch/push origin differs from the installed brain source."
            )


def _fetch(git: str, repository: Path, ref: str) -> str:
    _run_git(
        git,
        "-c",
        "core.hooksPath=/dev/null",
        "-C",
        str(repository),
        "fetch",
        "--quiet",
        "--no-tags",
        "origin",
        ref,
    )
    commit = _run_git(git, "-C", str(repository), "rev-parse", "FETCH_HEAD").strip()
    if not COMMIT.fullmatch(commit):
        raise BrainError("Git returned an invalid remote commit identifier.")
    return commit


def _ref(name: str) -> str:
    if not PROPOSAL_NAME.fullmatch(name):
        raise BrainError("Proposal name must be 1–64 lowercase letters, digits or hyphens.")
    return f"refs/heads/groundray/{name}"


def attach_authoring(
    settings: Settings,
    repository: Path,
    slug: str | None = None,
    *,
    apply: bool = False,
    as_of: str | None = None,
) -> dict[str, Any]:
    """Attach a checked clone at exactly the installed version; preview by default."""
    catalog = load_catalog(settings)
    brain = _selected(settings, slug)
    git = _git()
    checkout, _ = _verified_installed_checkout(settings, brain, git)
    repository = repository.expanduser().absolute()
    if repository.is_symlink() or not repository.is_dir() or repository.resolve() != repository:
        raise BrainError("Authoring path must be a real directory without symlink components.")
    if repository == checkout.resolve() or settings.data_dir.resolve() in repository.parents:
        raise BrainError("Authoring repository must be outside managed brain storage.")
    top = _run_git(git, "-C", str(repository), "rev-parse", "--show-toplevel").strip()
    if Path(top).resolve() != repository:
        raise BrainError("Authoring path must be the root of its own Git working tree.")
    manifest = read_manifest(repository)
    if manifest.id != brain.id or manifest.slug != brain.slug:
        raise BrainError("Authoring repository identity differs from the installed brain.")
    if clean_repository_head(repository) != brain.commit:
        raise BrainError(
            "Authoring HEAD must exactly match the installed commit. Sync explicitly first."
        )
    if _run_git(git, "-C", str(repository), "branch", "--show-current").strip() != "main":
        raise BrainError("Authoring repository must be on main.")
    _origin(git, repository, brain)
    report = validate_bundle(repository / manifest.bundle, as_of=as_of)
    if not report.profile_passes:
        raise BrainError("Authoring knowledge bundle failed validation.")
    previous = brain.authoring
    if previous is not None and Path(previous).resolve() != repository:
        raise BrainError(
            "Brain already has a different authoring repository; refusing to replace it."
        )
    if apply:
        save_catalog(catalog.updating(replace(brain, authoring=str(repository))), settings)
    return {
        "ok": True,
        "slug": brain.slug,
        "commit": brain.commit,
        "authoring": str(repository),
        "applied": apply,
        "changed": apply and previous != str(repository),
        "validation_warnings": [f.as_dict() for f in report.warnings],
    }


def _paths(git: str, repository: Path, base: str, commit: str, bundle: str) -> list[str]:
    paths = sorted(
        set(
            p
            for p in _run_git(
                git,
                "-C",
                str(repository),
                "diff-tree",
                "--no-commit-id",
                "--name-only",
                "-r",
                "-m",
                "-z",
                f"{base}..{commit}",
            ).split("\0")
            if p
        )
    )
    unsafe = [p for p in paths if p != "brain.yaml" and not p.startswith(f"{bundle}/")]
    if unsafe:
        raise BrainError(
            "Proposal history contains files outside the brain boundary: " + ", ".join(unsafe[:8])
        )
    return paths


def propose_brain(
    settings: Settings,
    name: str,
    slug: str | None = None,
    *,
    apply: bool = False,
    as_of: str | None = None,
) -> dict[str, Any]:
    """Publish a new proposal ref only; never replace an existing proposal or main."""
    ref = _ref(name)
    brain, repository, manifest = authoring_repository(settings, slug)
    git = _git()
    _verified_installed_checkout(settings, brain, git)
    _origin(git, repository, brain)
    commit = clean_repository_head(repository)
    if commit != brain.commit:
        raise BrainError("Save and activate authoring changes before proposing them.")
    report = validate_bundle(repository / manifest.bundle, as_of=as_of)
    if not report.profile_passes:
        raise BrainError("Proposal knowledge bundle failed validation.")
    base = _fetch(git, repository, "refs/heads/main")
    if base == commit:
        raise BrainError("There is no unpublished update to propose.")
    if not _git_is_ancestor(git, repository, base, commit):
        raise BrainError("Published main is newer or diverged; refusing to propose stale work.")
    paths = _paths(git, repository, base, commit, manifest.bundle)
    if _run_git(git, "-C", str(repository), "ls-remote", "--refs", "origin", ref).strip():
        raise BrainError("Proposal already exists. Use a new proposal name for a new revision.")
    if apply:
        # Empty expected value is a create-only lease: it cannot overwrite any ref.
        _run_git(
            git,
            "-c",
            "core.hooksPath=/dev/null",
            "-C",
            str(repository),
            "push",
            "--quiet",
            f"--force-with-lease={ref}:",
            "origin",
            f"{commit}:{ref}",
        )
    return {
        "ok": True,
        "slug": brain.slug,
        "source": brain.source,
        "proposal": name,
        "proposal_ref": ref,
        "base_commit": base,
        "proposal_commit": commit,
        "changed_paths": paths,
        "applied": apply,
        "published_main": False,
        "business_approval_recorded": False,
        "validation_warnings": [f.as_dict() for f in report.warnings],
    }


def review_proposal(
    settings: Settings,
    name: str,
    commit: str,
    slug: str | None = None,
    *,
    as_of: str | None = None,
    _source: tuple[str, str | None] | None = None,
) -> dict[str, Any]:
    """Inspect a fetched exact proposal without activating it or recording approval."""
    ref = _ref(name)
    if not COMMIT.fullmatch(commit):
        raise BrainError("Review requires the full 40-character proposal commit.")
    brain = _selected(settings, slug)
    git = _git()
    checkout, _ = _verified_installed_checkout(settings, brain, git)
    _origin(git, checkout, brain)
    actual = _fetch(git, checkout, ref)
    if actual != commit:
        raise BrainError(
            "Proposal moved from the requested commit; inspect the new version explicitly."
        )
    base = _fetch(git, checkout, "refs/heads/main")
    if base == commit or not _git_is_ancestor(git, checkout, base, commit):
        raise BrainError("Proposal is already published, outdated or diverged from main.")
    settings.cache_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".proposal-", dir=settings.cache_dir) as directory:
        worktree = Path(directory) / "brains" / brain.slug
        worktree.parent.mkdir()
        _run_git(
            git,
            "-c",
            "core.hooksPath=/dev/null",
            "-C",
            str(checkout),
            "worktree",
            "add",
            "--quiet",
            "--detach",
            str(worktree),
            commit,
        )
        try:
            manifest = read_manifest(worktree)
            if manifest.id != brain.id or manifest.slug != brain.slug:
                raise BrainError("Proposal changes the installed brain identity.")
            report = validate_bundle(worktree / manifest.bundle, as_of=as_of)
            if not report.profile_passes:
                raise BrainError("Proposal knowledge bundle failed validation.")
            paths = _paths(git, checkout, base, commit, manifest.bundle)
            diff = _run_git(
                git,
                "-C",
                str(checkout),
                "diff",
                "--no-ext-diff",
                "--no-textconv",
                "--no-color",
                base,
                commit,
                "--",
                "brain.yaml",
                manifest.bundle,
            )
            source_snapshot = None
            if _source is not None:
                inspection_settings = replace(
                    settings, data_dir=Path(directory), cache_dir=Path(directory) / "cache"
                )
                inspection_brain = replace(brain, name=manifest.name, commit=commit, authoring=None)
                save_catalog(
                    BrainCatalog(brains=(inspection_brain,), active=brain.slug),
                    inspection_settings,
                )
                source_snapshot = get_source(
                    inspection_settings, _source[0], _source[1], brain.slug, as_of=as_of
                )
                # This checkout is disposable; never expose a path that vanishes on return.
                source_snapshot["source"]["local_path"] = None
        finally:
            _run_git(
                git,
                "-c",
                "core.hooksPath=/dev/null",
                "-C",
                str(checkout),
                "worktree",
                "remove",
                "--force",
                str(worktree),
            )
    result = {
        "ok": True,
        "slug": brain.slug,
        "source": brain.source,
        "proposal": name,
        "proposal_ref": ref,
        "base_commit": base,
        "proposal_commit": commit,
        "installed_commit": brain.commit,
        "changed_paths": paths,
        "diff": diff,
        "business_approval_recorded": False,
        "validation_warnings": [f.as_dict() for f in report.warnings],
    }
    if source_snapshot is not None:
        result["source_snapshot"] = source_snapshot
    return result


def get_proposal_source(
    settings: Settings,
    name: str,
    commit: str,
    reference: str,
    source_id: str | None = None,
    slug: str | None = None,
    *,
    as_of: str | None = None,
) -> dict[str, Any]:
    """Read exact original bytes from a checked proposal without installing it."""
    review = review_proposal(
        settings, name, commit, slug, as_of=as_of, _source=(reference, source_id)
    )
    snapshot = review.pop("source_snapshot")
    snapshot["inspection"] = {
        key: review[key]
        for key in (
            "proposal",
            "proposal_ref",
            "proposal_commit",
            "base_commit",
            "installed_commit",
        )
    }
    snapshot["business_approval_recorded"] = False
    return snapshot


def publish_proposal(
    settings: Settings,
    name: str,
    commit: str,
    base: str,
    slug: str | None = None,
    *,
    as_of: str | None = None,
) -> dict[str, Any]:
    """Publish the inspected descendant with a compare-and-swap on reviewed main."""
    if not COMMIT.fullmatch(base):
        raise BrainError("Publication requires the full reviewed base commit.")
    result = review_proposal(settings, name, commit, slug, as_of=as_of)
    if result["base_commit"] != base:
        raise BrainError("Published main moved since review. Review again before publication.")
    brain = _selected(settings, slug)
    git = _git()
    checkout, _ = _verified_installed_checkout(settings, brain, git)
    _origin(git, checkout, brain)
    if _fetch(git, checkout, result["proposal_ref"]) != commit:
        raise BrainError("Proposal moved during publication; refusing to publish.")
    # Ancestry was checked above. The lease adds compare-and-swap; no history rewrite is allowed.
    _run_git(
        git,
        "-c",
        "core.hooksPath=/dev/null",
        "-C",
        str(checkout),
        "push",
        "--quiet",
        f"--force-with-lease=refs/heads/main:{base}",
        "origin",
        f"{commit}:refs/heads/main",
    )
    result.pop("diff")
    result["published_main"] = True
    result["installed_brain_changed"] = False
    result["needs_sync"] = True
    return result
