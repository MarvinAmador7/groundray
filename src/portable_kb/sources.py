"""Explicit text-source capture and immutable local-source retrieval.

Captures are opaque artifacts, not concepts or verified business claims. The
capture receipt describes copying, never authorship or approval of the original.
"""

from __future__ import annotations

import hashlib
import json
import os
import posixpath
import re
import shutil
import stat
import subprocess
import tempfile
from contextlib import suppress
from dataclasses import dataclass
from difflib import unified_diff
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import unquote, urlsplit

from .authoring import slugify, utc_timestamp
from .brains import (
    InstalledBrain,
    authoring_repository,
    brain_status,
    clean_repository_head,
    commit_authoring_changes,
    refresh_brain_from_authoring,
)
from .models import ValidationReport
from .operations import _append_log
from .search import _healthy_brain, get_knowledge_item
from .settings import Settings
from .validation import is_valid_actor, validate_bundle

MAX_SOURCE_BYTES = 1024 * 1024
CAPTURE_ROOT = "references/captures"
CAPTURE_ATTRIBUTES = b"* -text -filter -ident -working-tree-encoding\n"
RECEIPT_SUFFIX = ".capture.json"
PORTABLE_PART = re.compile(r"[a-z0-9][a-z0-9._-]{0,199}")


class SourceError(ValueError):
    """Source handling failed without granting new knowledge authority."""


def _git(repository: Path, *args: str) -> bytes:
    executable = shutil.which("git")
    if executable is None:
        raise SourceError("Git is required to handle saved sources.")
    try:
        return subprocess.run(
            [
                executable,
                "--no-replace-objects",
                "-c",
                "core.hooksPath=/dev/null",
                "-C",
                str(repository),
                *args,
            ],
            check=True,
            capture_output=True,
            timeout=120,
        ).stdout
    except (OSError, subprocess.SubprocessError) as error:
        raise SourceError(
            "Git could not inspect or save the source; the operation did not complete."
        ) from error


def _safe_file(bundle: Path, relative: str) -> Path:
    parts = PurePosixPath(relative).parts
    if (
        not parts
        or PurePosixPath(relative).is_absolute()
        or ".." in parts
        or "\\" in relative
        or "\x00" in relative
        or any(p.startswith(".") for p in parts)
    ):
        raise SourceError("Source path must remain inside the visible knowledge bundle.")
    path = bundle.joinpath(*parts)
    if not path.resolve().is_relative_to(bundle.resolve()) or any(
        bundle.joinpath(*parts[:i]).is_symlink() for i in range(len(parts) + 1)
    ):
        raise SourceError("Source path contains a symbolic link or escapes the knowledge bundle.")
    return path


def _capture_path(value: str) -> str:
    parts = value.split("/")
    if (
        not value.startswith(CAPTURE_ROOT + "/")
        or not all(PORTABLE_PART.fullmatch(part) for part in parts)
        or any(part in {".", ".."} for part in parts)
    ):
        raise SourceError(f"Capture path must be a portable lowercase path under {CAPTURE_ROOT}/.")
    return value + ".txt" if value.endswith(".md") else value


def _one_line(value: str, label: str, limit: int) -> str:
    if not value.strip() or len(value) > limit or any(c in value for c in "\r\n\x00"):
        raise SourceError(f"{label} must be one non-empty line of at most {limit} characters.")
    return value


@dataclass(frozen=True, slots=True)
class SourceFileChange:
    path: str
    before: bytes | None
    after: bytes


@dataclass(frozen=True, slots=True)
class SourceCapturePlan:
    brain: InstalledBrain
    repository: Path
    base_commit: str
    path: str
    receipt: dict[str, Any]
    changes: tuple[SourceFileChange, ...]
    validation: ValidationReport

    def as_dict(self) -> dict[str, Any]:
        return {
            "operation": "source-capture",
            "brain": self.brain.slug,
            "base_commit": self.base_commit,
            "applied": False,
            "saved_version": None,
            "capture": self.receipt,
            "source_entry": {"resource": "/" + self.path, "title": self.receipt["title"]},
            "changes": [
                {
                    "path": c.path,
                    "kind": "create" if c.before is None else "update",
                    "diff": "".join(
                        unified_diff(
                            (c.before or b"").decode("utf-8").splitlines(keepends=True),
                            c.after.decode("utf-8").splitlines(keepends=True),
                            fromfile=c.path,
                            tofile=c.path,
                        )
                    ),
                }
                for c in self.changes
            ],
            "validation_warnings": [f.as_dict() for f in self.validation.warnings],
        }


def plan_source_capture(
    settings: Settings,
    file: Path,
    *,
    destination: str | None = None,
    actor: str = "process:portable-kb",
    title: str | None = None,
    origin: str | None = None,
    slug: str | None = None,
    as_of: str | None = None,
) -> SourceCapturePlan:
    """Plan a new immutable source copy, receipt, byte-preserving rules and log entry."""
    brain, repository, manifest = authoring_repository(settings, slug)
    if not brain_status(settings, brain.slug, as_of=as_of)["ok"]:
        raise SourceError(
            "Installed brain must be clean, pinned and valid before capturing sources."
        )
    base_commit = clean_repository_head(repository)
    if not is_valid_actor(actor):
        raise SourceError(
            "Capture actor must use the existing human, process or producer/version syntax."
        )
    file = file.expanduser().absolute()
    if file.is_symlink() or not file.is_file() or not stat.S_ISREG(file.stat().st_mode):
        raise SourceError("Capture input must be a regular file, not a symbolic link.")
    with file.open("rb") as handle:
        material = handle.read(MAX_SOURCE_BYTES + 1)
    if len(material) > MAX_SOURCE_BYTES:
        raise SourceError("Text-source capture is limited to 1 MiB per file.")
    try:
        material.decode("utf-8")
    except UnicodeDecodeError as error:
        raise SourceError(
            "Capture input must be UTF-8 text; binary files are not supported."
        ) from error
    if b"\x00" in material:
        raise SourceError("Capture input contains NUL bytes; binary files are not supported.")
    default_name = slugify(file.stem) + (
        file.suffix.lower() if re.fullmatch(r"\.[a-zA-Z0-9]+", file.suffix) else ".txt"
    )
    path = _capture_path(destination or f"{CAPTURE_ROOT}/{default_name}")
    bundle = repository / manifest.bundle
    _safe_file(bundle, path)
    receipt_path = path + RECEIPT_SUFFIX
    if (bundle / path).exists() or (bundle / receipt_path).exists():
        raise SourceError(
            "Capture destination already exists; retain it and choose a new revision path."
        )
    captured_at = utc_timestamp()
    receipt = {
        "schema_version": 1,
        "path": path,
        "original_name": file.name,
        "title": _one_line(title or file.name, "Title", 240),
        "bytes": len(material),
        "sha256": hashlib.sha256(material).hexdigest(),
        "captured": {"by": actor, "at": captured_at},
    }
    if origin is not None:
        receipt["origin"] = _one_line(origin, "Origin", 2048)
    receipt_bytes = (json.dumps(receipt, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    attributes = f"{CAPTURE_ROOT}/.gitattributes"
    attribute_path = bundle / attributes
    # Keep existing rules untouched, including rules that a descendant directory could override.
    for parent in (bundle / path).parents:
        if not parent.is_relative_to(bundle / CAPTURE_ROOT):
            break
        rules = parent / ".gitattributes"
        if rules.is_symlink() or (rules.exists() and rules.read_bytes() != CAPTURE_ATTRIBUTES):
            raise SourceError(
                "Capture directory has different Git attributes; review them separately."
            )
    if attribute_path.is_symlink():
        raise SourceError("Capture Git attributes cannot be a symbolic link.")
    changes = [
        SourceFileChange(path, None, material),
        SourceFileChange(receipt_path, None, receipt_bytes),
    ]
    if not attribute_path.exists():
        changes.append(SourceFileChange(attributes, None, CAPTURE_ATTRIBUTES))
    report = validate_bundle(bundle, as_of=as_of)
    if not report.profile_passes:
        raise SourceError("Authoring bundle is invalid; inspect validation before capture.")
    with tempfile.TemporaryDirectory(prefix="pkb-source-plan-") as temporary:
        proposed = Path(temporary) / "knowledge"
        shutil.copytree(bundle, proposed)
        for change in changes:
            target = proposed / change.path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(change.after)
        _append_log(
            proposed,
            captured_at[:10],
            f"**Source capture**: Added [{receipt['title']}]({path}); original bytes retained, no verification recorded.",
        )
        changes.append(
            SourceFileChange(
                "log.md", (bundle / "log.md").read_bytes(), (proposed / "log.md").read_bytes()
            )
        )
        report = validate_bundle(proposed, as_of=as_of)
        if not report.profile_passes:
            raise SourceError(
                "Proposed source capture fails bundle validation; no files were changed."
            )
    return SourceCapturePlan(brain, repository, base_commit, path, receipt, tuple(changes), report)


def _write_bytes(path: Path, content: bytes, *, create: bool) -> None:
    descriptor, name = tempfile.mkstemp(prefix=".pkb-source-", dir=path.parent)
    temporary = Path(name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        if create:
            os.link(temporary, path)  # Atomic create; a concurrent file is never overwritten.
        else:
            os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def save_source_capture(
    settings: Settings, plan: SourceCapturePlan, *, as_of: str | None = None
) -> dict[str, Any]:
    """Save exactly the planned bytes locally; leave organization publication explicit."""
    brain, repository, _manifest = authoring_repository(settings, plan.brain.slug)
    if (
        brain != plan.brain
        or repository != plan.repository
        or clean_repository_head(repository) != plan.base_commit
    ):
        raise SourceError("Brain changed after source capture planning; prepare a new plan.")
    if not brain_status(settings, brain.slug, as_of=as_of)["ok"]:
        raise SourceError("Installed brain changed after planning; inspect status before capture.")
    bundle = repository / "knowledge"
    applied: list[SourceFileChange] = []
    created_directories: list[Path] = []
    paths = ["knowledge/" + c.path for c in plan.changes]
    for change in plan.changes:
        target = bundle / change.path
        if change.path.endswith("/.gitattributes"):
            _safe_file(bundle, change.path.removesuffix("/.gitattributes") + "/placeholder")
        else:
            _safe_file(bundle, change.path)
        actual = target.read_bytes() if target.exists() else None
        if target.is_symlink() or actual != change.before:
            raise SourceError(
                "Source destination or log changed after planning; no files were overwritten."
            )
    try:
        for change in plan.changes:
            target = bundle / change.path
            missing = []
            parent = target.parent
            while not parent.exists():
                missing.append(parent)
                parent = parent.parent
            for parent in reversed(missing):
                parent.mkdir()
                created_directories.append(parent)
            actual = target.read_bytes() if target.exists() else None
            if target.is_symlink() or actual != change.before:
                raise SourceError(
                    "Source destination or log changed while saving; capture stopped."
                )
            _write_bytes(target, change.after, create=change.before is None)
            applied.append(change)
        raw_paths = [
            "knowledge/" + plan.path,
            "knowledge/" + plan.path + RECEIPT_SUFFIX,
            "knowledge/" + CAPTURE_ROOT + "/.gitattributes",
        ]
        attributes = _git(
            repository,
            "check-attr",
            "-z",
            "text",
            "filter",
            "ident",
            "working-tree-encoding",
            "--",
            *raw_paths,
        ).split(b"\x00")
        if len(attributes) != len(raw_paths) * 12 + 1 or any(
            value != b"unset" for value in attributes[2::3]
        ):
            raise SourceError(
                "Git attributes would transform source bytes; capture was not committed."
            )
        commit = commit_authoring_changes(
            repository,
            paths,
            expected_head=plan.base_commit,
            message=f"Capture source {PurePosixPath(plan.path).name}",
        )
    except Exception:
        if _git(repository, "rev-parse", "HEAD").decode().strip() == plan.base_commit:
            for change in reversed(applied):
                target = bundle / change.path
                if (
                    not target.is_symlink()
                    and target.is_file()
                    and target.read_bytes() == change.after
                ):
                    if change.before is None:
                        target.unlink()
                    else:
                        _write_bytes(target, change.before, create=False)
            _git(repository, "reset", "--quiet", "HEAD", "--", *paths)
            for directory in reversed(created_directories):
                with suppress(OSError):
                    directory.rmdir()
        raise
    for change in plan.changes:
        if (
            change.path.startswith(CAPTURE_ROOT + "/")
            and _read_blob(repository, commit, change.path) != change.after
        ):
            raise SourceError(
                f"Source commit {commit} did not retain planned capture/receipt bytes; installed version was not changed."
            )
    try:
        refresh = refresh_brain_from_authoring(settings, brain.slug, commit, as_of=as_of)
    except Exception as error:
        raise SourceError(
            f"Source was saved locally at {commit}, but the installed version could not be refreshed. Inspect brain status; the prior installed version is retained."
        ) from error
    return {
        **plan.as_dict(),
        "applied": True,
        "saved_version": commit,
        "previous_version": refresh["previous_commit"],
        "active_brain_updated": True,
        "retrieval_ready": True,
        "needs_reindex": True,
        "search_ready": False,
        "citation": {
            "brain_id": brain.id,
            "brain_slug": brain.slug,
            "commit": commit,
            "path": plan.path,
        },
        "get_command": ["pkb", "source", "get", plan.path, "--brain", brain.slug, "--json"],
        "reindex_command": ["pkb", "search", "index", brain.slug, "--json"],
    }


def _read_blob(repository: Path, commit: str, path: str) -> bytes:
    name = f"{commit}:knowledge/{path}"
    if int(_git(repository, "cat-file", "-s", name)) > MAX_SOURCE_BYTES:
        raise SourceError("Source exceeds the 1 MiB text-source limit.")
    return _git(repository, "cat-file", "blob", name)


def get_source(
    settings: Settings,
    reference: str,
    source_id: str | None = None,
    slug: str | None = None,
    *,
    as_of: str | None = None,
) -> dict[str, Any]:
    """Read a capture directly, or an item's declared local source, at the installed pin."""
    brain, checkout, bundle, health = _healthy_brain(settings, slug, as_of=as_of)
    context = None
    fragment = None
    if source_id is None:
        path = reference.removeprefix("knowledge/")
        if path != _capture_path(path):
            raise SourceError(
                "Use the saved capture path, including .md.txt for Markdown originals."
            )
        resource = "/" + path
    else:
        context = get_knowledge_item(settings, reference, brain.slug, as_of=as_of)
        if context["citation"]["commit"] != brain.commit:
            raise SourceError("Selected brain changed during source retrieval; retry explicitly.")
        sources = [
            s for s in context["item"]["metadata"].get("sources", []) if s.get("id") == source_id
        ]
        if len(sources) != 1:
            raise SourceError("Select exactly one source ID declared by the retrieved item.")
        resource = sources[0]["resource"]
        parsed = urlsplit(resource)
        if parsed.scheme or parsed.netloc or parsed.query:
            raise SourceError(
                "Source retrieval accepts saved local files only; external sources are not fetched."
            )
        value = unquote(parsed.path)
        if not value or "\\" in value or "\x00" in value:
            raise SourceError("Source resource is not a safe local path.")
        path = posixpath.normpath(
            value.lstrip("/")
            if value.startswith("/")
            else posixpath.join(posixpath.dirname(context["item"]["path"]), value)
        )
        fragment = parsed.fragment or None
    target = _safe_file(bundle, path)
    if not target.is_file():
        raise SourceError("Saved source file is missing from the selected brain.")
    material = _read_blob(checkout, brain.commit, path)
    try:
        content = material.decode("utf-8")
    except UnicodeDecodeError as error:
        raise SourceError("Saved source is not UTF-8 text; it was not transcoded.") from error
    sha256 = hashlib.sha256(material).hexdigest()
    receipt = None
    if path.startswith(CAPTURE_ROOT + "/"):
        receipt_file = _safe_file(bundle, path + RECEIPT_SUFFIX)
        if not receipt_file.is_file():
            raise SourceError("Capture receipt is missing; inspect the saved source version.")
        try:
            receipt = json.loads(_read_blob(checkout, brain.commit, path + RECEIPT_SUFFIX))
        except (ValueError, SourceError) as error:
            raise SourceError(
                "Capture receipt is missing or invalid; inspect the saved source version."
            ) from error
        if (
            not isinstance(receipt, dict)
            or receipt.get("schema_version") != 1
            or receipt.get("path") != path
            or receipt.get("sha256") != sha256
            or receipt.get("bytes") != len(material)
        ):
            raise SourceError("Capture receipt does not match the saved source bytes.")
    return {
        "brain": {"id": brain.id, "slug": brain.slug, "name": brain.name, "commit": brain.commit},
        "source": {
            "id": source_id,
            "resource": resource,
            "path": path,
            "local_path": str(target.absolute()),
            "bytes": len(material),
            "sha256": sha256,
            "content": content,
        },
        "capture_receipt": receipt,
        "citation": {
            "brain_id": brain.id,
            "brain_slug": brain.slug,
            "commit": brain.commit,
            "path": path,
        },
        "context_citation": context["citation"] if context else None,
        "fragment": fragment,
        "fragment_validated": False,
        "content_scope": "complete-file",
        "validation_warnings": health["validation_warnings"],
        "ok": True,
    }
