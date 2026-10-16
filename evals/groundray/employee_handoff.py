"""CLI-only proposal handoff over a local bare Git remote; no agents or host auth."""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import UTC, datetime
from pathlib import Path

from evals.groundray.engine_fit import ROOT, SLUG, Run, digest


def demonstrate(output: Path, native: Path) -> dict:
    output = output.absolute()
    if output.exists():
        raise ValueError("Choose a new output directory; never overwrite an earlier trace.")
    if not native.is_file():
        raise ValueError("Supply an existing native search binary.")
    output.mkdir(parents=True)
    run = Run(output, native.absolute())
    seed = output / "seed"
    seed.mkdir()
    fixture = ROOT / "examples/groundray-mosaic-cli"
    shutil.copyfile(fixture / "brain.yaml", seed / "brain.yaml")
    shutil.copytree(fixture / "knowledge", seed / "knowledge")
    run.git(seed, ["init", "--quiet", "--initial-branch=main"])
    run.git(seed, ["add", "brain.yaml", "knowledge"])
    run.git(seed, ["commit", "--quiet", "-m", "Seed fictional company from saved CLI fixture"])
    base = run.git(seed, ["rev-parse", "HEAD"]).strip()
    remote = output / "company.git"
    run.git(output, ["clone", "--quiet", "--bare", str(seed), str(remote)])
    source = remote.as_uri()
    for who in ("author", "reader"):
        run.cli(who, ["brain", "add", source])
    author = output / "author-clone"
    run.git(output, ["clone", "--quiet", source, str(author)])
    # An unfinished local file must remain intact after an attachment refusal.
    unfinished = author / "unfinished.txt"
    unfinished.write_text("preserve this work\n")
    run.cli("author", ["brain", "attach", str(author), "--brain", SLUG, "--apply"], expected=1)
    assert unfinished.read_text() == "preserve this work\n"
    unfinished.unlink()
    preview = run.cli("author", ["brain", "attach", str(author), "--brain", SLUG])
    assert preview["applied"] is False
    run.cli("author", ["brain", "attach", str(author), "--brain", SLUG, "--apply"])
    before = run.cli("reader", ["get", "wiki/lumen-launch.md", "--brain", SLUG])
    run.cli("reader", ["search", "index", SLUG])
    run.cli("reader", ["search", "query", "AX-7", "--brain", SLUG])
    inputs = output / "inputs"
    inputs.mkdir()
    original = inputs / "delivery-note.txt"
    original.write_bytes(
        b"Fictional Mosaic Studio operations note, November 7.\r\n"
        b"The AX-7 rollout remains conditional; no client approval is recorded here.\r\n"
    )
    path = "references/captures/operations/delivery-note.txt"
    capture = [
        "source",
        "capture",
        str(original),
        "--path",
        path,
        "--brain",
        SLUG,
        "--actor",
        "process:groundray-handoff",
        "--title",
        "Synthetic operations note",
    ]
    run.cli("author", capture)
    run.cli("author", [*capture, "--apply"])
    body = inputs / "launch-revised.md"
    body.write_text(
        before["item"]["body"] + "\n## Additional retained record\n\n"
        "The [synthetic operations note](../references/captures/operations/delivery-note.txt) "
        "repeats the conditional rollout. It records no client approval; repetition "
        "does not establish acceptance or add an independent approval.\n"
    )
    metadata = inputs / "metadata.json"
    sources = before["item"]["metadata"]["sources"] + [
        {
            "id": "operations",
            "resource": "../references/captures/operations/delivery-note.txt",
            "title": "Synthetic operations note",
        }
    ]
    metadata.write_text(json.dumps({"sources": sources}))
    update = [
        "knowledge",
        "update",
        "wiki/lumen-launch.md",
        "--brain",
        SLUG,
        "--actor",
        "openai/codex",
        "--method",
        "agent-generated",
        "--body-file",
        str(body),
        "--metadata-file",
        str(metadata),
    ]
    run.cli("author", update)
    updated = run.cli("author", [*update, "--apply"])
    commit = updated["saved_version"]
    assert run.git(remote, ["rev-parse", "main"]).strip() == base
    planned = run.cli("author", ["brain", "propose", "delivery-evidence", "--brain", SLUG])
    assert planned["applied"] is False
    proposal = run.cli(
        "author", ["brain", "propose", "delivery-evidence", "--brain", SLUG, "--apply"]
    )
    assert proposal["proposal_commit"] == commit and proposal["base_commit"] == base
    run.cli(
        "author", ["brain", "propose", "delivery-evidence", "--brain", SLUG, "--apply"], expected=1
    )
    run.cli(
        "reader",
        ["brain", "review", "delivery-evidence", "--commit", base, "--brain", SLUG],
        expected=1,
    )
    review = run.cli(
        "reader", ["brain", "review", "delivery-evidence", "--commit", commit, "--brain", SLUG]
    )
    assert "Additional retained record" in review["diff"]
    assert review["business_approval_recorded"] is False
    assert (
        run.cli("reader", ["get", "wiki/lumen-launch.md", "--brain", SLUG])["citation"]["commit"]
        == base
    )
    accept = [
        "brain",
        "accept",
        "delivery-evidence",
        "--commit",
        commit,
        "--base",
        base,
        "--brain",
        SLUG,
    ]
    run.cli("reader", [*accept[:-2], "--base", "0" * 40, "--brain", SLUG], expected=1)
    # Fixture-only receive hook simulates a server refusing publication.
    hook = remote / "hooks/pre-receive"
    hook.write_text("#!/bin/sh\nexit 1\n")
    hook.chmod(0o755)
    run.cli("reader", accept, expected=1)
    assert run.git(remote, ["rev-parse", "main"]).strip() == base
    hook.unlink()
    published = run.cli("reader", accept)
    assert published["published_main"] and published["business_approval_recorded"] is False
    assert published["installed_commit"] == base
    # Dirty installed state is not overwritten by synchronization.
    dirty = output / "reader/data/brains" / SLUG / "local-notes.txt"
    dirty.write_text("retain my local notes\n")
    run.cli("reader", ["brain", "sync", SLUG], expected=1)
    assert dirty.read_text() == "retain my local notes\n"
    dirty.unlink()
    sync = run.cli("reader", ["brain", "sync", SLUG])
    assert sync["current_commit"] == commit
    after = run.cli("reader", ["get", "wiki/lumen-launch.md", "--brain", SLUG])
    assert after["item"]["id"] == before["item"]["id"]
    assert after["item"]["metadata"]["generated"]["by"] == "openai/codex"
    assert "verified" not in after["item"]["metadata"]
    saved = run.cli(
        "reader", ["source", "get", "wiki/lumen-launch.md", "operations", "--brain", SLUG]
    )
    assert saved["source"]["sha256"] == digest(original)
    assert saved["citation"]["commit"] == commit
    run.cli("reader", ["search", "query", "AX-7", "--brain", SLUG], expected=1)
    run.cli("reader", ["search", "index", SLUG])
    found = run.cli("reader", ["search", "query", "AX-7", "--brain", SLUG])
    assert any(r["citation"]["path"] == "wiki/lumen-launch.md" for r in found["results"])
    original_body = run.git(remote, ["cat-file", "blob", f"{base}:knowledge/wiki/lumen-launch.md"])
    assert "Additional retained record" not in original_body
    preserved = []
    for receipt in sorted((seed / "knowledge/references/captures").rglob("*.capture.json")):
        original_path = Path(str(receipt).removesuffix(".capture.json"))
        relative = original_path.relative_to(seed)
        distributed = output / "reader/data/brains" / SLUG / relative
        assert digest(original_path) == digest(distributed)
        preserved.append({"path": str(relative), "sha256": digest(distributed)})
    result = {
        "experiment": "groundray-employee-handoff-v1",
        "recorded_at": datetime.now(UTC).isoformat(),
        "scope": "Mechanical CLI demonstration on one Linux host; no fresh agent or human review.",
        "distribution": "Two isolated configurations, file:// bare Git remote; no real host permission or branch-protection test.",
        "base_commit": base,
        "proposal_commit": commit,
        "proposal_ref": proposal["proposal_ref"],
        "preserved_sources": preserved,
        "new_source_sha256": digest(original),
        "command_count": len(run.events),
        "expected_refusals": sum(e["exit_code"] == 1 for e in run.events),
        "checks": {
            "remote_install_attachment": True,
            "attachment_preview_read_only": True,
            "proposal_leaves_main_unchanged": True,
            "exact_commit_review_without_activation": True,
            "explicit_publication_then_sync": True,
            "source_bytes_preserved": len(preserved) == 21,
            "item_identity_preserved": True,
            "historical_body_retained": True,
            "stale_index_refused_then_rebuilt": True,
            "human_approval_fabricated": False,
        },
        "code_sha256": {
            p: digest(ROOT / p)
            for p in (
                "src/portable_kb/collaboration.py",
                "src/portable_kb/cli.py",
                "evals/groundray/employee_handoff.py",
            )
        },
        "native_sha256": digest(native),
    }
    (output / "result.json").write_text(json.dumps(result, indent=2) + "\n")
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--native-command", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(demonstrate(args.output, args.native_command), indent=2))


if __name__ == "__main__":
    main()
