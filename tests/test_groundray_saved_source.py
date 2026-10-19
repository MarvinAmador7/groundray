"""Saved-source bridge checks: exact originals, provenance boundaries and health."""

from __future__ import annotations

import hashlib
import subprocess
from datetime import UTC, datetime
from pathlib import Path

import pytest

from evals.groundray.saved_source import MAX_SOURCE_BYTES, read_saved_source
from groundray.authoring import (
    ConfidenceLevel,
    GenerationMethod,
    KnowledgeType,
    plan_knowledge_create,
    save_knowledge_create,
)
from groundray.brains import init_brain, load_catalog, sync_brain
from groundray.search import SearchError
from groundray.settings import Settings


def prepare(tmp_path: Path, material: bytes) -> tuple[Settings, str]:
    settings = Settings(data_dir=tmp_path / "data", cache_dir=tmp_path / "cache")
    repository = tmp_path / "company"
    today = datetime.now(UTC).date().isoformat()
    init_brain(str(repository), "Fictional source reader", "company", settings, as_of=today)
    record = repository / "knowledge/references/original.md.txt"
    record.parent.mkdir()
    record.write_bytes(material)
    for args in (["add", "knowledge/references"], ["commit", "-m", "Seed synthetic original"]):
        subprocess.run(
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
            ],
            check=True,
            capture_output=True,
        )
    sync_brain(settings, "company", as_of=today)
    plan = plan_knowledge_create(
        settings,
        item_type=KnowledgeType.CONCEPT,
        title="Original record context",
        description="Records the inspected synthetic source without certifying its authenticity.",
        actor="openai/codex",
        method=GenerationMethod.AGENT_GENERATED,
        body="# Record\n\n## Definition\n\nSupplied record.[^raw]\n\n## Context\n\nExternal origin.[^external]\n",
        relative_path="wiki/context.md",
        slug="company",
        as_of=today,
        sources=[
            {"id": "raw", "resource": "../references/original.md.txt#metric"},
            {
                "id": "external",
                "resource": "https://example.com/record",
                "title": "External origin",
            },
        ],
        confidence_level=ConfidenceLevel.MEDIUM,
        confidence_basis="Synthetic fixture, not human verification.",
    )
    result = save_knowledge_create(settings, plan, as_of=today)
    return settings, result.commit


def test_saved_original_retains_crlf_unicode_and_unknown_frontmatter(tmp_path: Path) -> None:
    raw = "---\r\nx-vendor: {unfamiliar: true}\r\n---\r\n# Metric\r\nFees €4000\r\n".encode()
    settings, commit = prepare(tmp_path, raw)
    before = load_catalog(settings)
    result = read_saved_source(settings, "wiki/context.md", "raw", slug="company")
    assert result["source"]["content"].encode() == raw
    assert result["source"]["sha256"] == hashlib.sha256(raw).hexdigest()
    assert result["citation"]["commit"] == commit == result["context_citation"]["commit"]
    assert result["fragment"] == "metric"
    assert "fragment not validated" in result["scope"]
    assert load_catalog(settings) == before


def test_undeclared_source_and_external_uri_are_refused(tmp_path: Path) -> None:
    settings, _ = prepare(tmp_path, b"original\n")
    with pytest.raises(ValueError, match="declared"):
        read_saved_source(settings, "wiki/context.md", "unrelated", slug="company")
    with pytest.raises(ValueError, match="local source captures"):
        read_saved_source(settings, "wiki/context.md", "external", slug="company")


def test_dirty_capture_cannot_be_read_as_pinned_evidence(tmp_path: Path) -> None:
    settings, _ = prepare(tmp_path, b"original\n")
    brain = load_catalog(settings).get("company")
    record = brain.checkout_path(settings) / "knowledge/references/original.md.txt"
    record.write_text("uncommitted replacement\n")
    with pytest.raises(SearchError, match="clean, pinned"):
        read_saved_source(settings, "wiki/context.md", "raw", slug="company")
    assert record.read_text() == "uncommitted replacement\n"


def test_source_size_limit_is_enforced_before_content_read(tmp_path: Path) -> None:
    settings, _ = prepare(tmp_path, b"a" * (MAX_SOURCE_BYTES + 1))
    with pytest.raises(ValueError, match="1 MiB"):
        read_saved_source(settings, "wiki/context.md", "raw", slug="company")


def test_non_utf8_record_is_not_silently_transcoded(tmp_path: Path) -> None:
    settings, _ = prepare(tmp_path, b"\xff\xfe\x00")
    with pytest.raises(UnicodeDecodeError):
        read_saved_source(settings, "wiki/context.md", "raw", slug="company")
