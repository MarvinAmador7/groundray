"""Build a self-contained native Groundray marketplace from canonical skills.

This is an explicit development build, not publication or host installation.
The native runtime must have the required commands, not merely a version label.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import re
import shutil
import struct
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BRIDGE = """## Packaged storage workflow

Resolve `../../scripts/groundray` relative to this skill and run its `check` once
before company operations. Use that quoted absolute executable wherever the
bundled [Portable KB workflow](references/portable-kb/SKILL.md) says `pkb`.
Read that workflow for setup, retrieval, source capture, edits, proposals, review
and publication. Use the supplied runtime; report compatibility failures rather
than guessing a replacement. For first installation use the bundled
[setup skill](../groundray-setup/SKILL.md). Plugin installation does not authorize
company publication, business approval or human verification.

"""


def sync_skills(repository: Path = ROOT) -> None:
    """Generate the packaged skill view without modifying canonical instructions."""
    plugin = repository / "plugins/groundray"
    destination = plugin / "skills/groundray"
    sources = repository / ".agents/skills"
    for root in (plugin, sources / "groundray-lite", sources / "portable-kb"):
        if root.is_symlink() or any(p.is_symlink() for p in root.rglob("*")):
            raise ValueError("Plugin and skill inputs must not contain symlinks")
    destination.mkdir(parents=True, exist_ok=True)
    text = (sources / "groundray-lite/SKILL.md").read_text()
    text = text.replace("name: groundray-lite\n", "name: groundray\n", 1)
    text = text.replace("# Groundray: show why\n\n", "# Groundray: show why\n\n" + BRIDGE, 1)
    (destination / "SKILL.md").write_text(text)
    storage = destination / "references/portable-kb"
    storage.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(sources / "portable-kb/SKILL.md", storage / "SKILL.md")
    references = storage / "references"
    references.mkdir(exist_ok=True)
    for p in sorted((sources / "portable-kb/references").glob("*.md")):
        shutil.copyfile(p, references / p.name)


def native_target(binary: Path) -> str:
    """Inspect the binary header; never label a script or foreign architecture native."""
    if binary.is_symlink() or not binary.is_file() or not os.access(binary, os.X_OK):
        raise ValueError("CLI must be an executable regular native file")
    with binary.open("rb") as stream:
        header = stream.read(32)
    if len(header) >= 20 and header[:4] == b"\x7fELF" and header[4:6] == b"\x02\x01":
        machine = struct.unpack_from("<H", header, 18)[0]
        target = {62: "linux-x86_64", 183: "linux-arm64"}.get(machine)
    elif len(header) >= 8 and header[:4] == b"\xcf\xfa\xed\xfe":
        machine = struct.unpack_from("<I", header, 4)[0]
        target = {0x01000007: "darwin-x86_64", 0x0100000C: "darwin-arm64"}.get(machine)
    else:
        target = None
    if target is None:
        raise ValueError("CLI must be a supported Linux/macOS Intel/ARM native executable")
    system = {"Linux": "linux", "Darwin": "darwin"}.get(platform.system())
    arch = {"x86_64": "x86_64", "arm64": "arm64", "aarch64": "arm64"}.get(platform.machine())
    if target != f"{system}-{arch}":
        raise ValueError("Build and probe on the executable's native platform")
    return target


def build(output: Path, cli: Path, repository: Path = ROOT) -> dict:
    output = output.absolute()
    if output.exists() or output.is_symlink():
        raise ValueError("Use a new output directory; existing packages are preserved")
    target = native_target(cli)
    plugin = repository / "plugins/groundray"
    if plugin.is_symlink() or any(p.is_symlink() for p in plugin.rglob("*")):
        raise ValueError("Plugin source must not contain symlinks")
    if (plugin / "runtime").exists():
        raise ValueError("Native runtime belongs in the output, not canonical plugin sources")
    manifest = json.loads((plugin / "plugin.json").read_text())
    if manifest.get("name") != "groundray" or re.fullmatch(
        r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?", str(manifest.get("version", ""))
    ) is None:
        raise ValueError("Plugin identity/version is invalid")
    output.parent.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix=".groundray-build-", dir=output.parent))
    try:
        packaged = stage / "plugins/groundray"
        shutil.copytree(plugin, packaged)
        runtime = packaged / "runtime"
        runtime.mkdir()
        (packaged / ".bundled-runtime").write_text("Bundled runtime required; no implicit PATH fallback.\n")
        shutil.copyfile(cli, runtime / "pkb")
        (runtime / "pkb").chmod(0o755)
        if native_target(runtime / "pkb") != target:
            raise ValueError("Native input changed while staging")
        version = subprocess.run([str(runtime / "pkb"), "--version"], check=True,
                                 text=True, capture_output=True, timeout=30).stdout.strip()
        if re.fullmatch(r"pkb 0\.2\.\d+", version) is None:
            raise ValueError("Groundray supports the 0.2.x CLI with required capabilities")
        environment = {**os.environ, "GROUNDRAY_PKB": str(runtime / "pkb")}
        subprocess.run([str(packaged / "scripts/groundray"), "check"], check=True,
                       capture_output=True, text=True, timeout=180, env=environment)
        cli_hash = hashlib.sha256((runtime / "pkb").read_bytes()).hexdigest()
        (runtime / "SHA256SUMS").write_text(f"{cli_hash}  pkb\n")
        info = {"plugin_version": manifest["version"], "cli_version": version,
                "target": target, "cli_sha256": cli_hash,
                "cli_compatibility": "0.2.x plus explicit command-capability probes"}
        (runtime / "build.json").write_text(json.dumps(info, indent=2) + "\n")
        catalog = json.loads((repository / ".agents/plugins/marketplace.json").read_text())
        (stage / ".agents/plugins").mkdir(parents=True)
        (stage / ".agents/plugins/marketplace.json").write_text(json.dumps(catalog, indent=2) + "\n")
        archive = stage / f"groundray-{manifest['version']}-{target}.zip"
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
            for p in sorted(stage.rglob("*")):
                if p.is_file() and p != archive:
                    bundle.write(p, p.relative_to(stage).as_posix())
        archive_hash = hashlib.sha256(archive.read_bytes()).hexdigest()
        (stage / "SHA256SUMS").write_text(f"{archive_hash}  {archive.name}\n")
        os.replace(stage, output)
        return {**info, "marketplace_root": str(output), "archive": str(output / archive.name),
                "archive_sha256": archive_hash}
    except BaseException:
        shutil.rmtree(stage, ignore_errors=True)
        raise


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sync-skills", action="store_true")
    parser.add_argument("--cli", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    if args.sync_skills:
        sync_skills()
    if args.cli is not None or args.output is not None:
        if args.cli is None or args.output is None:
            parser.error("--cli and --output are required together")
        print(json.dumps(build(args.output, args.cli)))
    elif not args.sync_skills:
        parser.error("Supply --sync-skills or --cli with --output")


if __name__ == "__main__":
    main()
