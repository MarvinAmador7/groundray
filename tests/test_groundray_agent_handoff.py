"""Ensure observed source exposure and frozen trial prompts are reported honestly."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from evals.groundray.agent_handoff import stage
from evals.groundray.agent_handoff_audit import role_trace


def test_source_return_does_not_infer_model_exposure_or_discard_cli_errors(tmp_path: Path):
    case = tmp_path / "case"
    work = case / "work"
    (work / "response").mkdir(parents=True)
    for skill in ("groundray-lite", "portable-kb"):
        target = work / f".agents/skills/{skill}"
        target.mkdir(parents=True)
        (target / "SKILL.md").write_text(f"{skill} skill text")
    (case / "trace").mkdir()
    body = "Original record that was returned by CLI but not printed to the model."
    payload = {
        "source": {
            "path": "references/captures/record.txt",
            "sha256": "saved-hash",
            "content": body,
        },
        "citation": {"commit": "a" * 40},
    }
    (case / "trace/1.json").write_text(
        json.dumps(
            {
                "actor": "agent",
                "exit_code": 0,
                "stdout": json.dumps(payload),
                "argv": ["source", "get"],
            }
        )
    )
    (case / "trace/2.json").write_text(
        json.dumps(
            {
                "actor": "agent",
                "exit_code": 1,
                "stdout": "",
                "stderr": "Candidate moved",
                "argv": ["brain", "review"],
            }
        )
    )
    (case / "trace/3.json").write_text(
        json.dumps({"actor": "publisher", "exit_code": 0, "stdout": "{}"})
    )
    (case / "events.jsonl").write_text(
        json.dumps(
            {
                "item": {
                    "command": "pkb source get > record.json",
                    "exit_code": 0,
                    "aggregated_output": "groundray-lite skill text\nportable-kb skill text",
                }
            }
        )
        + "\n"
    )
    (work / "response/answer.md").write_text("Unedited answer")
    (case / "final.json").write_text(json.dumps({"answer": "Unedited answer"}))
    result = role_trace(case)
    assert result["cli_commands"] == 2
    assert result["cli_nonzero_exits"] == 1
    assert result["cli_errors"][0]["stderr"] == "Candidate moved"
    assert result["distinct_returned_source_paths"] == 1
    assert result["cli_returned_sources"][0]["complete_body_in_observer_output"] is False
    assert all(result["skill_text_in_observer_output"].values())
    assert result["answer_matches_recorded_final"] is True
    (work / "response/answer.md").write_text("A later repaired answer")
    assert role_trace(case)["answer_matches_recorded_final"] is False


def test_staging_preserves_a_prior_trial_prompt(tmp_path: Path):
    work = tmp_path / "reviewer/work"
    work.mkdir(parents=True)
    stage(tmp_path, "reviewer", "actual-proposal", "a" * 40)
    original = (work / "prompt.txt").read_bytes()
    with pytest.raises(ValueError, match="preserve the original trial"):
        stage(tmp_path, "reviewer", "replacement", "b" * 40)
    assert (work / "prompt.txt").read_bytes() == original


def test_json_encoded_crlf_source_counts_as_visible_text(tmp_path: Path):
    case = tmp_path / "case"
    work = case / "work"
    (work / "response").mkdir(parents=True)
    for skill in ("groundray-lite", "portable-kb"):
        p = work / f".agents/skills/{skill}"
        p.mkdir(parents=True)
        (p / "SKILL.md").write_text("skill")
    (case / "trace").mkdir()
    payload = {
        "source": {
            "path": "references/captures/raw.txt",
            "sha256": "hash",
            "content": "UTF-8 café\r\nRetained CRLF\r\n",
        },
        "citation": {"commit": "a" * 40},
    }
    encoded = json.dumps(payload)
    (case / "trace/1.json").write_text(
        json.dumps({"actor": "agent", "exit_code": 0, "stdout": encoded, "argv": []})
    )
    (case / "events.jsonl").write_text(
        json.dumps(
            {"item": {"command": "pkb source get", "exit_code": 0, "aggregated_output": encoded}}
        )
        + "\n"
    )
    assert role_trace(case)["cli_returned_sources"][0]["complete_body_in_observer_output"] is True


def test_existing_unread_file_is_not_inspected_link_evidence(tmp_path: Path):
    import hashlib

    from evals.groundray.agent_handoff_audit import inspect_answer_links

    case = tmp_path / "case"
    response = case / "work/response"
    response.mkdir(parents=True)
    read = case / "source with spaces.txt"
    read.write_bytes(b"Inspected original\r\n")
    unread = case / "unread.txt"
    unread.write_text("Not inspected")
    answer = response / "answer.md"
    answer.write_text(
        f"[Read](<{read}>) [Unread]({unread}) [Relative](../../source%20with%20spaces.txt)"
    )
    sources = [
        {
            "local_path": str(read),
            "sha256": hashlib.sha256(read.read_bytes()).hexdigest(),
            "commit": "a" * 40,
        }
    ]
    checks = inspect_answer_links(case, answer, sources)
    assert all(c["exists_at_audit"] for c in checks)
    assert [c["matches_returned_source_path"] for c in checks] == [True, False, True]
    assert [c["matches_returned_source_hash"] for c in checks] == [True, False, True]
    read.write_text("Changed after retrieval")
    assert inspect_answer_links(case, answer, sources)[0]["matches_returned_source_hash"] is False


def test_out_of_case_link_does_not_trigger_external_content_read(tmp_path: Path, monkeypatch):
    from evals.groundray.agent_handoff_audit import inspect_answer_links

    case = tmp_path / "case"
    case.mkdir()
    outside = tmp_path / "outside.txt"
    outside.write_text("Outside case")
    link = case / "symlink.txt"
    link.symlink_to(outside)
    answer = case / "answer.md"
    answer.write_text(f"[Outside]({link})")

    def fail_read(_path):
        raise AssertionError("Must not hash an external link target")

    monkeypatch.setattr("evals.groundray.agent_handoff_audit.digest", fail_read)
    checks = inspect_answer_links(
        case, answer, [{"local_path": str(link), "sha256": "fake", "commit": "a" * 40}]
    )
    assert checks[0]["within_case"] is False
    assert checks[0]["matches_returned_source_hash"] is False


def test_used_reference_links_include_matching_sources_and_ignore_unused_definitions(tmp_path):
    import hashlib

    from evals.groundray.agent_handoff_audit import inspect_answer_links

    source = tmp_path / "original with spaces.txt"
    source.write_bytes(b"Original\r\n")
    answer = tmp_path / "answer.md"
    answer.write_text(
        "[Evidence][ OWNER ] [Again][owner] [Missing][] [Shortcut]\n\n"
        f'[owner]: <{source}> "Owner record"\n'
        "[missing]: absent.txt\n[shortcut]: original%20with%20spaces.txt\n"
        "[unused]: unused.txt\nA footnote[^note]\n[^note]: [Ordinary prose]\n"
    )
    checks = inspect_answer_links(
        tmp_path,
        answer,
        [{"local_path": str(source), "sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
          "commit": "a" * 40}],
    )
    assert len(checks) == 3
    assert [c["exists_at_audit"] for c in checks] == [True, False, True]
    assert [c["matches_returned_source_hash"] for c in checks] == [True, False, True]
