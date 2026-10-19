"""Reproducible G0 storage/interface demonstration; no model or network calls.

Use a new output directory. Runs the source-tree CLI with isolated configs
and an explicitly supplied native sidecar. Creates fictional fixture records,
not a general importer or employee collaboration service.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

from groundray.settings import SearchProvider, Settings, save_settings

ROOT = Path(__file__).resolve().parents[2]
FIXTURES = ROOT / "evals/groundray/fixtures/engine-fit"
SOURCES = ROOT / "docs/groundray-simple/sources"
AS_OF = datetime.now(UTC).date().isoformat()
SLUG = "mosaic-studio"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def capture_path(relative: str) -> str:
    """Explicit fixture convention: Markdown originals become opaque .md.txt copies."""
    return relative + ".txt" if relative.endswith(".md") else relative


class Run:
    def __init__(self, output: Path, native: Path):
        self.output = output
        self.events: list[dict] = []
        self.env = dict(os.environ, PYTHONPATH=os.pathsep.join((str(ROOT / "src"), str(ROOT))))
        self.configs = {}
        for name in ("author", "reader"):
            config = output / name / "config.yaml"
            settings = Settings(
                data_dir=output / name / "data",
                cache_dir=output / name / "cache",
                search_provider=SearchProvider.BUILTIN,
                native_command=str(native),
            )
            save_settings(settings, config)
            self.configs[name] = config

    def command(self, args: list[str], *, expected: int = 0) -> str:
        result = subprocess.run(
            args, cwd=ROOT, env=self.env, capture_output=True, text=True, timeout=180
        )
        self.events.append(
            {
                "argv": args,
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
            }
        )
        (self.output / "trace.json").write_text(json.dumps(self.events, indent=2) + "\n")
        if result.returncode != expected:
            raise RuntimeError(
                f"Expected {expected}, got {result.returncode}: {args}\n{result.stderr}"
            )
        return result.stdout

    def cli(self, who: str, args: list[str], *, expected: int = 0) -> dict | None:
        text = self.command(
            [
                sys.executable,
                "-m",
                "groundray",
                *args,
                "--config",
                str(self.configs[who]),
                "--as-of",
                AS_OF,
                "--json",
            ],
            expected=expected,
        )
        return json.loads(text) if text.strip() else None

    def git(self, repository: Path, args: list[str]) -> str:
        return self.command(
            [
                "git",
                "--no-replace-objects",
                "-c",
                "core.hooksPath=/dev/null",
                "-c",
                "user.name=Groundray G0 fixture process",
                "-c",
                "user.email=groundray-g0@localhost.invalid",
                "-C",
                str(repository),
                *args,
            ]
        )


def demonstrate(output: Path, native: Path, *, cli_sources: bool = False) -> dict:
    output = output.absolute()
    native = native.absolute()
    if output.exists():
        raise ValueError("Choose a new output directory; previous runs are never overwritten.")
    if not native.is_file():
        raise ValueError("Provide an existing groundray-search native executable.")
    output.mkdir(parents=True)
    run = Run(output, native)
    repository = output / "company"
    run.cli(
        "author",
        [
            "brain",
            "init",
            str(repository),
            "--name",
            "Mosaic Studio fictional G0",
            "--slug",
            SLUG,
            "--no-publish",
        ],
    )
    records = []
    for source in sorted(SOURCES.rglob("*")):
        if not source.is_file():
            continue
        relative = source.relative_to(SOURCES).as_posix()
        prefix = "references/captures" if cli_sources else "references"
        target = repository / "knowledge" / prefix / capture_path(relative)
        if cli_sources:
            args = [
                "source",
                "capture",
                str(source),
                "--path",
                f"{prefix}/{relative}",
                "--actor",
                "openai/codex",
                "--origin",
                f"Synthetic fixture: {relative}",
                "--brain",
                SLUG,
            ]
            before = run.git(repository, ["rev-parse", "HEAD"]).strip()
            preview = run.cli("author", args)
            assert not preview["applied"]
            assert run.git(repository, ["rev-parse", "HEAD"]).strip() == before
            assert not run.git(repository, ["status", "--porcelain"]).strip()
            saved = run.cli("author", [*args, "--apply"])
            assert saved["capture"]["sha256"] == digest(source)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
        records.append(
            {
                "original": f"docs/groundray-simple/sources/{relative}",
                "capture": target.relative_to(repository).as_posix(),
                "bytes": source.stat().st_size,
                "sha256": digest(source),
            }
        )
        assert target.read_bytes() == source.read_bytes()
    if cli_sources:
        (output / "source-captures.json").write_text(json.dumps(records, indent=2) + "\n")
    else:
        (repository / "source-captures.json").write_text(json.dumps(records, indent=2) + "\n")
        run.git(repository, ["add", "knowledge/references", "source-captures.json"])
        run.git(repository, ["commit", "-m", "Seed authorized synthetic source copies for G0"])
        run.cli("author", ["brain", "sync", SLUG])

    pages = []
    inputs = output / "inputs"
    inputs.mkdir()
    for body_path in sorted(FIXTURES.glob("*.md")):
        body = body_path.read_text()
        input_body = body_path
        if cli_sources:
            body = body.replace("../references/", "../references/captures/")
            input_body = inputs / body_path.name
            input_body.write_text(body)
        title = body.splitlines()[0].removeprefix("# ")
        sources = [
            {"id": match[1], "resource": match[3], "title": match[2]}
            for match in re.finditer(r"^\[\^([a-z0-9-]+)\]: \[([^\]]+)\]\(([^)]+)\)\.$", body, re.M)
        ]
        source_file = inputs / f"{body_path.stem}.json"
        source_file.write_text(json.dumps(sources, indent=2) + "\n")
        args = [
            "knowledge",
            "create",
            "--type",
            "concept",
            "--title",
            title,
            "--description",
            f"Scoped fictional company evidence: {title.lower()}.",
            "--actor",
            "openai/codex",
            "--method",
            "agent-generated",
            "--path",
            f"wiki/{body_path.name}",
            "--body-file",
            str(input_body),
            "--sources-file",
            str(source_file),
            "--confidence",
            "medium",
            "--confidence-basis",
            "Root-authored synthetic synopsis; records inspectable; no human verification.",
            "--brain",
            SLUG,
        ]
        before = run.git(repository, ["rev-parse", "HEAD"]).strip()
        plan = run.cli("author", args)
        assert not plan["applied"] and run.git(repository, ["rev-parse", "HEAD"]).strip() == before
        assert not run.git(repository, ["status", "--porcelain"]).strip()
        saved = run.cli("author", [*args, "--apply"])
        pages.append({"path": saved["path"], "item_id": saved["item_id"], "sources": sources})
        fetched = run.cli("author", ["get", saved["item_id"], "--brain", SLUG])
        assert fetched["item"]["body"].strip() == body.strip()
        assert fetched["item"]["metadata"]["generated"]["by"] == "openai/codex"
        assert (
            fetched["item"]["status"] == "draft" and "verified" not in fetched["item"]["metadata"]
        )

    first_commit = run.git(repository, ["rev-parse", "HEAD"]).strip()
    run.cli("reader", ["brain", "add", str(repository)])
    for page in pages:
        run.cli("reader", ["get", page["path"], "--brain", SLUG])
        links = run.cli("reader", ["links", page["path"], "--brain", SLUG])
        # All cross-page links are resolved now that all three drafts exist.
        assert all(link["resolution"] == "resolved" for link in links["links"])
    run.cli("reader", ["get", "index.md", "--brain", SLUG])
    run.cli(
        "reader", ["get", f"{prefix}/tables/ledger-reconciled.csv", "--brain", SLUG], expected=1
    )
    if cli_sources:
        for record in records:
            saved = run.cli(
                "reader",
                ["source", "get", record["capture"].removeprefix("knowledge/"), "--brain", SLUG],
            )
            assert saved["source"]["sha256"] == record["sha256"]
            assert saved["capture_receipt"]["sha256"] == record["sha256"]
    source_reads = []
    for page in pages:
        for source in page["sources"]:
            if cli_sources:
                result = run.cli(
                    "reader", ["source", "get", page["path"], source["id"], "--brain", SLUG]
                )
            else:
                raw = run.command(
                    [
                        sys.executable,
                        "-m",
                        "evals.groundray.saved_source",
                        page["path"],
                        source["id"],
                        "--brain",
                        SLUG,
                        "--config",
                        str(run.configs["reader"]),
                        "--as-of",
                        AS_OF,
                    ]
                )
                result = json.loads(raw)
            record = next(
                r for r in records if r["capture"] == f"knowledge/{result['source']['path']}"
            )
            assert result["source"]["sha256"] == record["sha256"]
            assert result["citation"]["commit"] == first_commit
            source_reads.append(result)
    run.cli("reader", ["search", "index", SLUG])
    discoveries = {}
    for query, expected_path in (
        ("retainer", "wiki/lumen-commercial.md"),
        ("margin", "wiki/lumen-margin.md"),
        ("AX-7", "wiki/lumen-launch.md"),
    ):
        found = run.cli("reader", ["search", "query", query, "--brain", SLUG])
        assert any(hit["citation"]["path"] == expected_path for hit in found["results"])
        discoveries[query] = found

    margin = FIXTURES / "lumen-margin.md"
    revised = inputs / "margin-revised.md"
    revised.write_text(
        (
            margin.read_text().replace("../references/", "../references/captures/")
            if cli_sources
            else margin.read_text()
        )
        + "\n## Inspection note\n\nThe 62.5% project calculation does not establish collected cash or a complete company close.\n"
    )
    update_args = [
        "knowledge",
        "update",
        "wiki/lumen-margin.md",
        "--brain",
        SLUG,
        "--actor",
        "openai/codex",
        "--method",
        "agent-generated",
        "--body-file",
        str(revised),
    ]
    run.cli("author", update_args)
    updated = run.cli("author", [*update_args, "--apply"])
    second_commit = updated["saved_version"]
    before_sync = run.cli("reader", ["get", "wiki/lumen-margin.md", "--brain", SLUG])
    assert before_sync["citation"]["commit"] == first_commit
    sync = run.cli("reader", ["brain", "sync", SLUG])
    assert sync["current_commit"] == second_commit
    after_sync = run.cli("reader", ["get", "wiki/lumen-margin.md", "--brain", SLUG])
    assert after_sync["citation"]["commit"] == second_commit
    assert after_sync["item"]["id"] == before_sync["item"]["id"]
    run.cli("reader", ["search", "query", "margin", "--brain", SLUG], expected=1)
    run.cli("reader", ["search", "index", SLUG])
    run.cli("reader", ["search", "query", "margin", "--brain", SLUG])
    old_text = run.git(
        repository, ["cat-file", "blob", f"{first_commit}:knowledge/wiki/lumen-margin.md"]
    )
    assert "## Inspection note" not in old_text
    for record in records:
        assert digest(repository / record["capture"]) == record["sha256"]
        assert digest(output / "reader/data/brains" / SLUG / record["capture"]) == record["sha256"]
    shutil.copytree(repository / "knowledge", output / "bundle")
    shutil.copyfile(repository / "brain.yaml", output / "brain.yaml")
    report = {
        "experiment": "groundray-g0-cli-sources-v1"
        if cli_sources
        else "groundray-g0-engine-fit-v1",
        "source_workflow": "groundray source capture/get"
        if cli_sources
        else "manual fixture copies/development reader",
        "recorded_at": datetime.now(UTC).isoformat(),
        "validation_as_of": AS_OF,
        "fictional_business_as_of": "2026-11-06",
        "engine_commit": subprocess.check_output(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True
        ).strip(),
        "native_sha256": digest(native),
        "skill_sha256": digest(ROOT / ".agents/skills/groundray-lite/SKILL.md"),
        "scope": "Mechanical development demonstration; root-authored pages; no fresh agent trial or human review.",
        "distribution": "Two isolated configurations on one Linux host, local Git source, no remote permissions or protected review.",
        "first_commit": first_commit,
        "second_commit": second_commit,
        "sources": records,
        "pages": pages,
        "source_reads": source_reads,
        "discovery": discoveries,
        "checks": {
            "source_bytes_preserved": True,
            "plan_read_only": True,
            "bodies_preserved": True,
            "relative_links_resolved": True,
            "independent_install": True,
            "declared_source_reads_pinned": True,
            "explicit_sync": True,
            "historical_body_retained": True,
            "stale_index_refused": True,
            "rebuild_search": True,
            "human_verification_fabricated": False,
        },
        "command_count": len(run.events),
        "expected_refusals": 2,
    }
    (output / "result.json").write_text(json.dumps(report, indent=2) + "\n")
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--native-command", type=Path, required=True)
    parser.add_argument(
        "--cli-sources",
        action="store_true",
        help="Use supported source capture/get instead of the G0 development bridge.",
    )
    args = parser.parse_args()
    result = demonstrate(args.output, args.native_command, cli_sources=args.cli_sources)
    print(
        json.dumps(
            {key: result[key] for key in ("experiment", "command_count", "checks")}, indent=2
        )
    )


if __name__ == "__main__":
    main()
