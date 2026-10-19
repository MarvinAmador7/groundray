"""Verify native plugin installation/discovery with an isolated real Claude Code host.

No model calls or authentication. This checks host loading and native commands,
not assistant behavior, personal source inspection or employee participation.
"""
from __future__ import annotations

import argparse
import hashlib
import http.server
import json
import os
import shutil
import subprocess
import threading
from functools import partial
from pathlib import Path

from smoke_groundray_install import QuietHandler

ROOT = Path(__file__).resolve().parents[1]


def smoke(package: Path, claude: Path, output: Path) -> dict:
    if output.exists():
        raise ValueError("Use a new Claude smoke directory")
    output.mkdir(parents=True)
    metadata = json.loads((package / "plugins/groundray/runtime/build.json").read_text())
    version = metadata["plugin_version"]
    tag = "v" + version
    name = f"groundray-{tag}-{metadata['target']}.tar.gz"
    release = output / "releases" / tag
    release.mkdir(parents=True)
    shutil.copyfile(package / name, release / name)
    digest = hashlib.sha256((release / name).read_bytes()).hexdigest()
    (release / "SHA256SUMS").write_text(f"{digest}  {name}\n")
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(QuietHandler, directory=str(release.parent))
    )
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    profile = output / "isolated Claude config"
    profile.mkdir()
    settings = profile / "settings.json"
    keep_settings = {"permissions": {"deny": ["Bash(sudo *)"]}}
    settings.write_text(json.dumps(keep_settings))
    company = output / "company config" / "groundray/config.yaml"
    company.parent.mkdir(parents=True)
    company.write_bytes(b"existing company/provider settings\r\n")
    original_company = company.read_bytes()
    install_root = output / "persistent package with spaces"
    environment = {
        **os.environ,
        "CLAUDE_CONFIG_DIR": str(profile),
        "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
        "DISABLE_AUTOUPDATER": "1",
        "GROUNDRAY_CLAUDE": str(claude),
        "GROUNDRAY_CLI": "",
        "GROUNDRAY_INSTALL_DIR": str(install_root),
        "GROUNDRAY_VERSION": tag,
        "GROUNDRAY_RELEASE_BASE_URL": f"http://127.0.0.1:{server.server_port}",
        "XDG_CONFIG_HOME": str(company.parent.parent),
    }
    traces = []

    def run(argv):
        result = subprocess.run(argv, env=environment, cwd=output, capture_output=True,
                                text=True, timeout=180)
        traces.append({"argv": [str(a) for a in argv], "exit_code": result.returncode,
                       "stdout": result.stdout, "stderr": result.stderr})
        (output / "operations.json").write_text(json.dumps(traces, indent=2) + "\n")
        if result.returncode:
            raise RuntimeError(f"Claude smoke failed: {argv}\n{result.stdout}\n{result.stderr}")
        return result.stdout

    def host(*args):
        return run([str(claude), *args])

    try:
        # Seed an older manifest at the same managed source path. This tests host
        # version refresh; it deliberately uses the candidate runtime, not an old CLI.
        marketplace = install_root / "marketplace"
        shutil.copytree(package / "plugins/groundray", marketplace / "plugins/groundray")
        (marketplace / ".claude-plugin").mkdir()
        shutil.copyfile(package / ".claude-plugin/marketplace.json",
                        marketplace / ".claude-plugin/marketplace.json")
        manifest_path = marketplace / "plugins/groundray/.claude-plugin/plugin.json"
        manifest = json.loads(manifest_path.read_text())
        manifest["version"] = "0.0.0"
        manifest_path.write_text(json.dumps(manifest))
        (marketplace / ".groundray-install").write_text("v0.0.0\n")
        host("plugin", "marketplace", "add", str(marketplace), "--scope", "user", "--json")
        host("plugin", "install", "groundray@groundray", "--scope", "user", "--json")
        initial = json.loads(host("plugin", "list", "--json"))
        assert next(p for p in initial if p["id"] == "groundray@groundray")["version"] == "0.0.0"

        other = output / "unrelated marketplace"
        (other / ".claude-plugin").mkdir(parents=True)
        (other / ".claude-plugin/marketplace.json").write_text(json.dumps({
            "name": "preservation-fixture", "owner": {"name": "Fixture"},
            "plugins": [{"name": "keep-me", "source": "./keep-me"}],
        }))
        (other / "keep-me/.claude-plugin").mkdir(parents=True)
        (other / "keep-me/.claude-plugin/plugin.json").write_text(json.dumps({
            "name": "keep-me", "version": "1.0.0", "description": "Preservation fixture",
            "author": {"name": "Fixture"},
        }))
        other_skill = other / "keep-me/skills/keep-me/SKILL.md"
        other_skill.parent.mkdir(parents=True)
        other_skill.write_text("---\nname: keep-me\ndescription: Preservation fixture.\n---\nNo company operations.\n")
        host("plugin", "marketplace", "add", str(other), "--scope", "user", "--json")
        host("plugin", "install", "keep-me@preservation-fixture", "--scope", "user", "--json")
        before_other = next(p for p in json.loads(host("plugin", "list", "--json"))
                            if p["id"] == "keep-me@preservation-fixture")
        cached_other = Path(before_other["installPath"]) / "skills/keep-me/SKILL.md"
        original_other = cached_other.read_bytes()

        for _ in range(2):
            run(["sh", str(ROOT / "install-groundray"), "--host", "claude"])
            entries = json.loads(host("plugin", "list", "--json"))
            item = next(p for p in entries if p["id"] == "groundray@groundray")
            assert item["scope"] == "user" and item["enabled"] is True
            assert item["version"] == version
            # Local marketplaces load in place on this host. Inspect the actual
            # declared load root, falling back to the installed cache on older hosts.
            loaded = Path(item.get("readFromFolder", item["installPath"]))
            assert loaded == marketplace / "plugins/groundray" or loaded.is_relative_to(profile)
            for skill in ("groundray", "groundray-setup"):
                path = loaded / f"skills/{skill}/SKILL.md"
                assert path.read_bytes() == (package / f"plugins/groundray/skills/{skill}/SKILL.md").read_bytes()
                helper = (path.parent / "../../scripts/groundray").resolve()
                run([str(helper), "check"])
            assert (loaded / "runtime/groundray").read_bytes() == (package / "plugins/groundray/runtime/groundray").read_bytes()
            details = host("plugin", "details", "groundray@groundray")
            assert "Skills (2)" in details and "groundray-setup" in details
            assert "Hooks (0)" in details and "MCP servers (0)" in details
            after_other = next(p for p in entries if p["id"] == "keep-me@preservation-fixture")
            assert after_other == before_other
            assert cached_other.read_bytes() == original_other
            assert company.read_bytes() == original_company
            assert json.loads(settings.read_text())["permissions"] == keep_settings["permissions"]
            # Reinstall must recover the explicitly selected plugin if disabled,
            # while preserving unrelated settings and plugins.
            host("plugin", "disable", "groundray@groundray", "--scope", "user", "--json")
        host("plugin", "enable", "groundray@groundray", "--scope", "user", "--json")
        assert list(install_root.glob(".previous.*/plugins/groundray"))
        report = {
            "tag": tag, "target": metadata["target"], "host_version": host("--version").strip(),
            "installed": True, "enabled": True, "skills_discovered": ["groundray", "groundray-setup"],
            "manifest_version_refresh": True, "fixture_uses_candidate_runtime": True,
            "reinstall_and_reenable": True, "unrelated_plugin_settings_company_preserved": True,
            "isolated_claude_config": True, "model_calls": 0,
            "assistant_activation_tested": False,
        }
        (output / "result.json").write_text(json.dumps(report, indent=2) + "\n")
        return report
    finally:
        server.shutdown()
        thread.join()
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument("--claude", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(smoke(args.package.resolve(), args.claude.resolve(), args.output.resolve())))


if __name__ == "__main__":
    main()
