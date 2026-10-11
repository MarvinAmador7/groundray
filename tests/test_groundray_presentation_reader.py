"""Regression checks for citation inspection and the artificial source budget."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from evals.groundray.presentation_reader import read_material


def source(root: Path, name: str, text: str = "supplied record") -> Path:
    path = root / "sources" / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text)
    return path


def test_citation_prefix_fragment_and_encoded_name(tmp_path: Path) -> None:
    source(tmp_path, "owner/metric rule.md", "# Metric\n\nFees €4000\n")
    assert read_material(tmp_path, "source", "sources/owner/metric%20rule.md#metric") == (
        "# Metric\n\nFees €4000\n"
    )
    event = json.loads((tmp_path / "reads.jsonl").read_text())
    assert event["path"] == "owner/metric rule.md"
    assert event["bytes"] == len("# Metric\n\nFees €4000\n".encode())


def test_rereading_canonical_target_does_not_spend_another_slot(tmp_path: Path) -> None:
    for name in ("a.txt", "b.txt", "c.txt", "d.txt"):
        source(tmp_path, name)
    for target in ("a.txt", "sources/a.txt#section", "b.txt", "c.txt", "./a.txt"):
        read_material(tmp_path, "source", target)
    with pytest.raises(ValueError, match="Three distinct"):
        read_material(tmp_path, "source", "sources/d.txt")
    assert len((tmp_path / "reads.jsonl").read_text().splitlines()) == 5


def test_view_read_does_not_consume_source_budget(tmp_path: Path) -> None:
    (tmp_path / "view.md").write_text("answer")
    assert read_material(tmp_path, "view") == "answer"
    for name in ("a.txt", "b.txt", "c.txt"):
        source(tmp_path, name)
        read_material(tmp_path, "source", name)


def test_outside_link_is_rejected_without_recording_read(tmp_path: Path) -> None:
    outside = tmp_path / "outside.txt"
    outside.write_text("not part of packet")
    (tmp_path / "sources").mkdir()
    for target in ("sources/%2E%2E/outside.txt#section", str(outside)):
        with pytest.raises(ValueError):
            read_material(tmp_path, "source", target)
    assert not (tmp_path / "reads.jsonl").exists()


def test_missing_source_does_not_record_a_successful_read(tmp_path: Path) -> None:
    with pytest.raises(ValueError, match="existing file"):
        read_material(tmp_path, "source", "sources/missing.md#section")
    assert not (tmp_path / "reads.jsonl").exists()
