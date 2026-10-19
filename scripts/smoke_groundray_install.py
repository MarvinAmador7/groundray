"""Exercise the release installer with a real, isolated Codex host and local assets."""

from __future__ import annotations

import argparse
import hashlib
import http.server
import json
import os
import shutil
import subprocess
import threading
import time
from functools import partial
from pathlib import Path


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format, *args):
        pass


def smoke(package: Path, codex: Path, output: Path) -> dict:
    if output.exists():
        raise ValueError("Use a new install-smoke directory")
    output.mkdir(parents=True)
    metadata = json.loads((package / "plugins/groundray/runtime/build.json").read_text())
    tag = "v" + metadata["cli_version"].removeprefix("groundray ")
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
    install_root = output / "persistent package with spaces"
    # Codex requires an explicitly selected test home to exist already.
    (output / "isolated-codex").mkdir()
    environment = {
        **os.environ,
        "CODEX_HOME": str(output / "isolated-codex"),
        "GROUNDRAY_CODEX": str(codex),
        "GROUNDRAY_INSTALL_DIR": str(install_root),
        "GROUNDRAY_VERSION": tag,
        "GROUNDRAY_RELEASE_BASE_URL": f"http://127.0.0.1:{server.server_port}",
    }
    results = []
    try:
        def host(*args):
            result = subprocess.run(
                [str(codex), *args], env=environment, capture_output=True,
                text=True, timeout=60,
            )
            if result.returncode:
                raise RuntimeError(f"Codex fixture failed: {result.stderr}")
            return json.loads(result.stdout)

        # Exercise migration by ID with a current-runtime fixture, plus another
        # plugin in that same legacy marketplace. This is not an old-binary test.
        legacy = output / "legacy-marketplace"
        shutil.copytree(package / "plugins/groundray", legacy / "plugins/groundray")
        manifest_path = legacy / "plugins/groundray/plugin.json"
        manifest = json.loads(manifest_path.read_text())
        manifest["version"] = "0.1.0-dev.2"
        manifest_path.write_text(json.dumps(manifest))
        catalog = json.loads((package / ".agents/plugins/marketplace.json").read_text())
        catalog["name"] = "groundray-dev"
        catalog["plugins"].append({
            "name": "keep-me", "source": {"source": "local", "path": "./plugins/keep-me"},
            "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
        })
        (legacy / ".agents/plugins").mkdir(parents=True)
        (legacy / ".agents/plugins/marketplace.json").write_text(json.dumps(catalog))
        other = legacy / "plugins/keep-me"
        (other / "skills/keep-me").mkdir(parents=True)
        (other / "plugin.json").write_text(json.dumps({
            "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
            "name": "keep-me", "version": "1.0.0", "description": "Installation preservation fixture",
        }))
        (other / "skills/keep-me/SKILL.md").write_text(
            "---\nname: keep-me\ndescription: Installation preservation fixture.\n---\n\nNo company operations.\n"
        )
        host("plugin", "marketplace", "add", str(legacy), "--json")
        host("plugin", "add", "groundray@groundray-dev", "--json")
        added = host("plugin", "add", "keep-me@groundray-dev", "--json")
        other_cached = Path(added["installedPath"]) / "skills/keep-me/SKILL.md"
        original_other_bytes = other_cached.read_bytes()
        for _ in range(2):
            started = time.perf_counter()
            result = subprocess.run(
                ["sh", "install-groundray"], env=environment,
                text=True, capture_output=True, timeout=180,
            )
            results.append({"elapsed_seconds": time.perf_counter() - started,
                            "exit_code": result.returncode,
                            "stdout": result.stdout, "stderr": result.stderr})
            (output / "attempts.json").write_text(json.dumps(results, indent=2) + "\n")
            if result.returncode:
                raise RuntimeError(
                    f"Installer failed ({result.returncode}):\n{result.stdout}\n{result.stderr}"
                )
        listing = subprocess.run(
            [str(codex), "plugin", "list", "--marketplace", "groundray", "--json"],
            env=environment, check=True, capture_output=True, text=True, timeout=60,
        )
        entries = json.loads(listing.stdout)["installed"]
        expected_root = install_root / "marketplace/plugins/groundray"
        assert len(entries) == 1 and entries[0]["pluginId"] == "groundray@groundray"
        assert entries[0]["enabled"] is True
        assert entries[0]["version"] == metadata["plugin_version"]
        assert Path(entries[0]["source"]["path"]) == expected_root
        assert (expected_root / "runtime/groundray").is_file()
        remaining = host("plugin", "list", "--marketplace", "groundray-dev", "--json")
        assert [p["pluginId"] for p in remaining["installed"]] == ["keep-me@groundray-dev"]
        assert other_cached.read_bytes() == original_other_bytes
        report = {"tag": tag, "target": metadata["target"], "installed": True,
                  "enabled": True, "reinstall_preserves_persistent_source": True,
                  "development_registration_migrated": True,
                  "legacy_fixture_uses_current_runtime": True,
                  "unrelated_plugin_and_legacy_marketplace_preserved": True,
                  "isolated_codex_home": True, "model_calls": 0, "runs": results}
        (output / "result.json").write_text(json.dumps(report, indent=2) + "\n")
        return report
    finally:
        server.shutdown()
        thread.join()
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    report = smoke(args.package.resolve(), args.codex.resolve(), args.output.resolve())
    print(json.dumps({k: v for k, v in report.items() if k != "runs"}))


if __name__ == "__main__":
    main()
