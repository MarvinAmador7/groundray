"""Exercise a packaged native runtime with isolated employees and a local remote.

No model, host-role or business-approval claim. Runtime HOME/auth remain intact.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path


def smoke(package: Path, output: Path) -> dict:
    if output.exists():
        raise ValueError("Use a new smoke output; previous runs are preserved")
    output.mkdir(parents=True)
    wrapper = (package / "plugins/groundray/scripts/groundray").resolve()
    operations = []

    def environment(employee):
        root = output / employee
        root.mkdir(exist_ok=True)
        config = root / "gitconfig"
        config.write_text("[commit]\n\tgpgsign = false\n")
        return {**os.environ, "XDG_CONFIG_HOME": str(root / "config"),
                "XDG_DATA_HOME": str(root / "data"), "XDG_CACHE_HOME": str(root / "cache"),
                "GIT_CONFIG_GLOBAL": str(config), "GIT_CONFIG_NOSYSTEM": "1",
                "GIT_AUTHOR_NAME": "Groundray package fixture",
                "GIT_AUTHOR_EMAIL": "fixture@example.invalid",
                "GIT_COMMITTER_NAME": "Groundray package fixture",
                "GIT_COMMITTER_EMAIL": "fixture@example.invalid"}

    envs = {name: environment(name) for name in ["seed", "author", "reader"]}

    def call(employee, *args):
        env = {k: v for k, v in envs[employee].items() if k != "GROUNDRAY_CLI"}
        r = subprocess.run([str(wrapper), *args], env=env, text=True,
                           capture_output=True, timeout=180)
        record = {"actor": "root-fixture", "employee": employee, "argv": list(args),
                  "exit_code": r.returncode, "stdout": r.stdout, "stderr": r.stderr}
        operations.append(record)
        with (output / "operations.jsonl").open("a") as log:
            log.write(json.dumps(record) + "\n")
        if r.returncode:
            raise RuntimeError(f"Package operation failed: {args}: {r.stderr}")
        return json.loads(r.stdout) if args[-1:] == ("--json",) else r.stdout

    def git(*args):
        return subprocess.check_output(["git", "-c", "core.hooksPath=/dev/null", *args],
                                       text=True, env=envs["seed"]).strip()

    call("seed", "check")
    for employee in envs:
        call(employee, "setup", "--non-interactive", "--search-provider", "builtin")
    seed = output / "seed/brain"
    call("seed", "brain", "init", str(seed), "--name", "Groundray packaging fixture",
         "--slug", "package-smoke", "--no-publish", "--json")
    original = output / "seed/original.txt"
    original.write_bytes(b"Fictional packaging record\r\nCurrent forecast is conditional.\r\n")
    capture = call("seed", "source", "capture", str(original), "--brain", "package-smoke",
                   "--actor", "openai/codex", "--path", "references/captures/original.txt",
                   "--apply", "--json")
    source = {**capture["source_entry"], "id": "original"}
    body = output / "seed/body.md"
    body.write_text("# Package record\n\nThe fictional forecast remains conditional.\n")
    sources = output / "seed/sources.json"
    sources.write_text(json.dumps([source]))
    created = call("seed", "knowledge", "create", "--type", "concept", "--title", "Package record", "--description", "Synthetic packaging record",
                   "--body-file", str(body), "--sources-file", str(sources),
                   "--actor", "openai/codex", "--method", "agent-generated",
                   "--confidence", "medium", "--confidence-basis", "Synthetic package test",
                   "--sensitivity", "internal", "--brain", "package-smoke", "--apply", "--json")
    remote = output / "company.git"
    git("clone", "--quiet", "--bare", str(seed), str(remote))
    base = git("--git-dir", str(remote), "rev-parse", "main")
    for employee in ["author", "reader"]:
        call(employee, "brain", "add", remote.as_uri(), "--json")
        call(employee, "brain", "use", "package-smoke")
        call(employee, "search", "index", "package-smoke", "--json")
    clone = output / "author/authoring"
    git("clone", "--quiet", remote.as_uri(), str(clone))
    call("author", "brain", "attach", str(clone), "--brain", "package-smoke", "--apply", "--json")
    update = output / "author/update.txt"
    update.write_bytes(b"Fictional revised record\r\nA changed estimate does not authorize a promise.\r\n")
    revised = call("author", "source", "capture", str(update), "--brain", "package-smoke",
                   "--actor", "openai/codex", "--path", "references/captures/update.txt",
                   "--apply", "--json")
    replacement = output / "author/body.md"
    replacement.write_text("# Package record\n\nThe revised estimate remains conditional; earlier evidence is retained.\n")
    metadata = output / "author/metadata.json"
    metadata.write_text(json.dumps({"sources": [source, {**revised["source_entry"], "id": "update"}]}))
    call("author", "knowledge", "update", created["item_id"], "--body-file", str(replacement),
         "--metadata-file", str(metadata), "--actor", "openai/codex", "--method", "agent-generated",
         "--brain", "package-smoke", "--apply", "--json")
    proposal = call("author", "brain", "propose", "package-update", "--brain", "package-smoke",
                    "--apply", "--json")
    candidate = proposal["proposal_commit"]
    assert git("--git-dir", str(remote), "rev-parse", "main") == base
    review = call("reader", "brain", "review", "package-update", "--brain", "package-smoke",
                  "--commit", candidate, "--json")
    original_view = call("reader", "brain", "review-source", "package-update",
                         "references/captures/update.txt", "--brain", "package-smoke",
                         "--commit", candidate, "--json")
    assert original_view["source"]["content"].encode() == update.read_bytes()
    assert original_view["source"]["local_path"] is None
    call("reader", "brain", "accept", "package-update", "--brain", "package-smoke",
         "--commit", candidate, "--base", base, "--json")
    call("reader", "brain", "sync", "package-smoke", "--json")
    call("reader", "search", "index", "package-smoke", "--json")
    result = call("reader", "search", "query", "revised estimate conditional", "--brain",
                  "package-smoke", "--json")
    assert result["provider"] == "builtin" and result["results"]
    saved = call("reader", "get", created["item_id"], "--brain", "package-smoke", "--json")
    assert saved["citation"]["commit"] == candidate
    fetched = call("reader", "source", "get", created["item_id"], "update", "--brain",
                   "package-smoke", "--json")
    assert fetched["source"]["content"].encode() == update.read_bytes()
    assert Path(fetched["source"]["local_path"]).read_bytes() == update.read_bytes()
    installed = output / "reader/data/groundray/brains/package-smoke/knowledge/references/captures/original.txt"
    assert installed.read_bytes() == original.read_bytes()
    report = {"model_runs": 0, "host_role_separation_tested": False,
              "business_approval_recorded": False, "base_commit": base,
              "candidate_commit": candidate, "operations": len(operations),
              "original_and_update_bytes_preserved": True, "native_keyword_query": True,
              "source_file_target_resolves": True, "review_base": review["base_commit"],
              "original_sha256": hashlib.sha256(original.read_bytes()).hexdigest()}
    (output / "result.json").write_text(json.dumps(report, indent=2) + "\n")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(smoke(args.package.resolve(), args.output.resolve())))
