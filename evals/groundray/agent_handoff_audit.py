"""Mechanical, nonsemantic audit of the recorded three-agent CLI handoff.

Business judgments remain separate manual evidence assessments. Successful CLI
returns do not prove the model read or understood every returned source.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from evals.groundray.agent_handoff import NEW_QA, git, snapshot
from evals.groundray.engine_fit import digest
from portable_kb.parsing import parse_concept
from portable_kb.validation import validate_bundle


def read_json(path: Path, fallback=None):
    return json.loads(path.read_text()) if path.is_file() else fallback


def role_trace(case: Path) -> dict:
    events = [json.loads(line)["item"] for line in (case / "events.jsonl").read_text().splitlines()]
    cli = [read_json(p) for p in sorted((case / "trace").glob("*.json"))]
    agent_cli = [t for t in cli if t.get("actor") == "agent"]
    observed = "\n".join(e.get("aggregated_output", "") for e in events if e["exit_code"] == 0)
    returned = []
    for entry in agent_cli:
        if entry["exit_code"] != 0:
            continue
        try:
            payload = json.loads(entry["stdout"])
        except ValueError:
            continue
        source = payload.get("source")
        if isinstance(source, dict) and isinstance(source.get("content"), str):
            returned.append(
                {
                    "path": source["path"],
                    "sha256": source["sha256"],
                    "commit": payload["citation"]["commit"],
                    "complete_body_in_observer_output": (
                        source["content"] in observed
                        or json.dumps(source["content"], ensure_ascii=True) in observed
                        or json.dumps(source["content"], ensure_ascii=False) in observed
                    ),
                }
            )
    work = case / "work"
    final = read_json(case / "final.json", {})
    answer = work / "response/answer.md"
    return {
        "runner": read_json(case / "runner.json"),
        "shell_commands": len(events),
        "shell_nonzero_exits": sum(e["exit_code"] != 0 for e in events),
        "cli_commands": len(agent_cli),
        "cli_nonzero_exits": sum(t["exit_code"] != 0 for t in agent_cli),
        "cli_errors": [
            {"argv": t["argv"], "exit_code": t["exit_code"], "stderr": t["stderr"]}
            for t in agent_cli
            if t["exit_code"] != 0
        ],
        "cli_returned_sources": returned,
        "distinct_returned_source_paths": len({r["path"] for r in returned}),
        "skill_text_in_observer_output": {
            skill: (work / f".agents/skills/{skill}/SKILL.md").read_text() in observed
            for skill in ("groundray-lite", "portable-kb")
        },
        "answer_matches_recorded_final": answer.exists()
        and answer.read_text() == final.get("answer"),
        "answer_words": len(answer.read_text().split()) if answer.exists() else 0,
        "absolute_file_links": [
            {"target": target, "exists_at_audit": Path(target).is_file()}
            for target in re.findall(
                r"\]\((/[^)]+)\)", answer.read_text() if answer.exists() else ""
            )
        ],
        "artifacts": final.get("artifacts", {}),
    }


def audit(output: Path) -> dict:
    manifest = read_json(output / "manifest.json")
    remote = output / "company.git"
    seed = output / "seed"
    author = output / "author/work/authoring"
    base = manifest["base_commit"]
    author_commit = git(author, "rev-parse", "HEAD")
    result = {
        "suite": manifest["suite"],
        "scope": "Mechanical audit; no automated semantic accuracy score.",
        "base_commit": base,
        "author_commit": author_commit,
        "published_commit": git(remote, "rev-parse", "main"),
        "roles": {},
        "preservation": {},
    }
    for info in manifest["cases"]:
        role = info["role"]
        case = output / role
        if not (case / "runner.json").is_file():
            continue
        traced = role_trace(case)
        current = snapshot(case / "work")
        protected = {
            p: h for p, h in info["input_snapshot"].items() if not p.startswith("authoring/")
        }
        traced["protected_inputs_unchanged"] = all(
            current.get(p) == h for p, h in protected.items()
        )
        traced["protocol_boundary"] = (
            "Recorded instructions only; not an enforced filesystem sandbox."
        )
        result["roles"][role] = traced
    old = parse_concept(seed / "knowledge/wiki/lumen-launch.md", seed / "knowledge").item
    new = parse_concept(author / "knowledge/wiki/lumen-launch.md", author / "knowledge").item
    if old is None or new is None:
        raise ValueError("Cannot inspect launch metadata")
    raw_files = [
        p
        for p in (seed / "knowledge/references/captures").rglob("*")
        if p.is_file() and p.name not in {".gitattributes"} and not p.name.endswith(".capture.json")
    ]
    originals = {str(p.relative_to(seed)): digest(p) for p in raw_files}
    unchanged = {name: digest(author / name) == want for name, want in originals.items()}
    captures = list((author / "knowledge/references/captures").rglob("*.capture.json"))
    new_capture = []
    for p in captures:
        raw = Path(str(p).removesuffix(".capture.json"))
        if raw.read_bytes() == NEW_QA.encode():
            receipt = read_json(p)
            new_capture.append(
                {
                    "path": str(raw.relative_to(author)),
                    "receipt_sha256_matches": receipt.get("sha256") == digest(raw),
                    "receipt_bytes_match": receipt.get("bytes") == len(NEW_QA.encode()),
                    "capture_actor": receipt.get("captured", {}).get("by"),
                }
            )
    result["preservation"] = {
        "original_capture_count": len(originals),
        "original_capture_hashes": originals,
        "all_original_captures_unchanged": all(unchanged.values()),
        "unchanged_capture_checks": unchanged,
        "new_source_captures": new_capture,
        "launch_id_preserved": old.id == new.id,
        "launch_created_at_preserved": old.metadata["created_at"] == new.metadata["created_at"],
        "launch_generated_by": new.metadata["generated"]["by"],
        "human_verification_added": "verified" in new.metadata
        and new.metadata.get("verified") != old.metadata.get("verified"),
        "launch_status": new.status,
        "unrelated_pages_unchanged": {
            p: digest(seed / p) == digest(author / p)
            for p in ("knowledge/wiki/lumen-commercial.md", "knowledge/wiki/lumen-margin.md")
        },
        "old_launch_blob_retained": git(
            remote, "cat-file", "blob", f"{base}:knowledge/wiki/lumen-launch.md"
        )
        == (seed / "knowledge/wiki/lumen-launch.md").read_text().strip(),
        "author_symlinks": [
            str(p.relative_to(author)) for p in author.rglob("*") if p.is_symlink()
        ],
        "validation": validate_bundle(author / "knowledge").as_dict(),
    }
    (output / "mechanical-audit.json").write_text(json.dumps(result, indent=2) + "\n")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    r = audit(args.output)
    print(
        json.dumps(
            {
                "roles": {
                    k: {
                        x: v[x]
                        for x in (
                            "shell_commands",
                            "shell_nonzero_exits",
                            "cli_commands",
                            "cli_nonzero_exits",
                            "answer_words",
                        )
                    }
                    for k, v in r["roles"].items()
                },
                "all_original_captures_unchanged": r["preservation"][
                    "all_original_captures_unchanged"
                ],
            }
        )
    )


if __name__ == "__main__":
    main()
