"""Check package identity, compatibility refusal and native runtime boundaries."""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import struct
import subprocess

import pytest
from typer.testing import CliRunner

from groundray import __version__
from groundray.cli import app, source_app
from scripts.build_groundray_plugin import BRIDGE, ROOT, build, native_target


def fake_cli(path, *, missing="", version=__version__):
    path.write_text(
        f'#!/bin/sh\nif [ "$1" = --version ]; then echo "groundray {version}"; exit 0; fi\n'
        f'if [ "$1 $2" = "{missing}" ]; then exit 2; fi\nexit 0\n'
    )
    path.chmod(0o755)
    return path


def test_packaged_guidance_matches_canonical_sources_and_relative_references():
    main = ROOT / "plugins/groundray/skills/groundray"
    expected = (ROOT / ".agents/skills/groundray-lite/SKILL.md").read_text()
    expected = expected.replace("name: groundray-lite\n", "name: groundray\n", 1)
    expected = expected.replace("# Groundray: show why\n\n", "# Groundray: show why\n\n" + BRIDGE, 1)
    assert (main / "SKILL.md").read_text() == expected
    storage = main / "references/storage"
    for p in [ROOT / ".agents/skills/groundray-storage/SKILL.md",
              *sorted((ROOT / ".agents/skills/groundray-storage/references").glob("*.md"))]:
        relative = p.relative_to(ROOT / ".agents/skills/groundray-storage")
        assert (storage / relative).read_bytes() == p.read_bytes()
    assert (main / "../../scripts/groundray").is_file()
    manifest = json.loads((ROOT / "plugins/groundray/plugin.json").read_text())
    assert (ROOT / "plugins/groundray" / manifest["extensions"]["com.openai"]["onboardingSkill"]).is_file()


def test_same_version_missing_capability_is_rejected_without_changing_brains(tmp_path):
    cli = fake_cli(tmp_path / "CLI with spaces", missing="brain review-source")
    marker = tmp_path / "company-record.txt"
    marker.write_text("Company state")
    r = subprocess.run([str(ROOT / "plugins/groundray/scripts/groundray"), "check"],
                       env={**os.environ, "GROUNDRAY_CLI": str(cli)},
                       text=True, capture_output=True)
    assert r.returncode != 0
    assert "lacks required command: brain review-source" in r.stderr
    assert marker.read_text() == "Company state"


def test_tampered_or_missing_bundled_runtime_never_falls_back_to_path(tmp_path):
    plugin = tmp_path / "plugin with spaces"
    (plugin / "scripts").mkdir(parents=True)
    runtime = plugin / "runtime"
    runtime.mkdir()
    wrapper = plugin / "scripts/groundray"
    shutil.copyfile(ROOT / "plugins/groundray/scripts/groundray", wrapper)
    wrapper.chmod(0o755)
    cli = fake_cli(runtime / "groundray")
    (runtime / "SHA256SUMS").write_text(f"{hashlib.sha256(cli.read_bytes()).hexdigest()}  groundray\n")
    env = {k: v for k, v in os.environ.items() if k != "GROUNDRAY_CLI"}
    assert subprocess.run([str(wrapper), "check"], env=env, capture_output=True).returncode == 0
    (runtime / "other").write_text("Other file")
    (runtime / "SHA256SUMS").write_text(f"{hashlib.sha256(b'Other file').hexdigest()}  other\n")
    assert subprocess.run([str(wrapper), "--version"], env=env, capture_output=True).returncode != 0
    (runtime / "SHA256SUMS").write_text(f"{hashlib.sha256(cli.read_bytes()).hexdigest()}  groundray\n")
    cli.write_text("Tampered")
    assert subprocess.run([str(wrapper), "--version"], env=env, capture_output=True).returncode != 0
    cli.unlink()
    assert subprocess.run([str(wrapper), "--version"], env=env, capture_output=True).returncode != 0
    shutil.rmtree(runtime)
    runtime.symlink_to(plugin / "absent")
    fallback = tmp_path / "bin"
    fallback.mkdir()
    fake_cli(fallback / "groundray")
    env["PATH"] = str(fallback) + os.pathsep + env["PATH"]
    assert subprocess.run([str(wrapper), "--version"], env=env, capture_output=True).returncode != 0
    runtime.unlink()
    (plugin / ".bundled-runtime").touch()
    assert subprocess.run([str(wrapper), "--version"], env=env, capture_output=True).returncode != 0


def test_native_header_rejects_script_and_foreign_architecture(tmp_path, monkeypatch):
    cli = fake_cli(tmp_path / "groundray")
    with pytest.raises(ValueError, match="native executable"):
        native_target(cli)
    header = bytearray(32)
    header[:6] = b"\x7fELF\x02\x01"
    struct.pack_into("<H", header, 18, 183)
    cli.write_bytes(header)
    monkeypatch.setattr("scripts.build_groundray_plugin.platform.system", lambda: "Linux")
    monkeypatch.setattr("scripts.build_groundray_plugin.platform.machine", lambda: "x86_64")
    with pytest.raises(ValueError, match="native platform"):
        native_target(cli)


def test_source_helper_on_path_rejects_itself_instead_of_recursing(monkeypatch, tmp_path):
    monkeypatch.delenv("GROUNDRAY_CLI", raising=False)
    wrapper = ROOT / "plugins/groundray/scripts/groundray"
    fallback = tmp_path / "bin"
    fallback.mkdir()
    (fallback / "groundray").symlink_to(wrapper)
    monkeypatch.setenv("PATH", str(fallback) + os.pathsep + os.environ["PATH"])
    result = subprocess.run([str(wrapper), "check"], capture_output=True, text=True, timeout=10)
    assert result.returncode != 0
    assert "helper resolved itself" in result.stderr


def test_build_refuses_existing_output_before_probing_or_mutating_it(tmp_path):
    output = tmp_path / "existing"
    output.mkdir()
    marker = output / "prior.json"
    marker.write_text("Retain previous package")
    with pytest.raises(ValueError, match="preserved"):
        build(output, tmp_path / "missing-cli")
    assert marker.read_text() == "Retain previous package"


def test_future_or_invalid_cli_version_is_not_silently_accepted(tmp_path):
    for version in ["0.4.0", "0.3.bad", "0.2.1"]:
        cli = fake_cli(tmp_path / "groundray", version=version)
        result = subprocess.run([str(ROOT / "plugins/groundray/scripts/groundray"), "check"],
                                env={**os.environ, "GROUNDRAY_CLI": str(cli)},
                                capture_output=True)
        assert result.returncode != 0


def test_plugin_check_validates_registered_commands_without_user_configuration(monkeypatch, tmp_path):
    monkeypatch.setenv("XDG_CONFIG_HOME", str(tmp_path / "absent"))
    result = CliRunner().invoke(app, ["plugin-check"])
    assert result.exit_code == 0
    assert result.stdout.strip() == f"Groundray CLI compatible: groundray {__version__}"
    assert not (tmp_path / "absent").exists()
    monkeypatch.setattr(source_app, "registered_commands", [
        command for command in source_app.registered_commands if command.name != "get"
    ])
    result = CliRunner().invoke(app, ["plugin-check"])
    assert result.exit_code == 2
    assert "lacks required command: source get" in result.output


def test_current_compatibility_check_launches_runtime_once(tmp_path):
    log = tmp_path / "launches"
    cli = tmp_path / "CLI with spaces"
    cli.write_text(
        f'#!/bin/sh\nprintf "%s\\n" "$*" >> "{log}"\n'
        f'if [ "$1" = plugin-check ]; then echo "Groundray CLI compatible: groundray {__version__}"; exit 0; fi\n'
        'exit 99\n'
    )
    cli.chmod(0o755)
    result = subprocess.run(
        [str(ROOT / "plugins/groundray/scripts/groundray"), "check"],
        env={**os.environ, "GROUNDRAY_CLI": str(cli)}, capture_output=True, text=True,
    )
    assert result.returncode == 0
    assert log.read_text().splitlines() == ["plugin-check"]
