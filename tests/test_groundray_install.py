"""Exercise installation failure and preservation boundaries with local release fixtures."""

from __future__ import annotations

import hashlib
import http.server
import io
import json
import os
import subprocess
import sys
import tarfile
import threading
from functools import partial
from pathlib import Path

import pytest

from groundray import __version__
from tests.test_distribution import QuietHandler, _release_target

ROOT = Path(__file__).resolve().parents[1]


def write_package(releases, *, extra=None, runtime_version=__version__, bad_runtime_hash=False):
    tag = f"v{__version__}"
    release = releases / tag
    release.mkdir(parents=True, exist_ok=True)
    runtime = (f'#!/bin/sh\nif [ "$1" = plugin-check ]; then echo "Groundray CLI compatible: groundray {runtime_version}";'
               f' else echo "groundray {runtime_version}"; fi\n').encode()
    digest = "0" * 64 if bad_runtime_hash else hashlib.sha256(runtime).hexdigest()
    files = {
        "plugins/groundray/runtime/groundray": runtime,
        "plugins/groundray/runtime/SHA256SUMS": f"{digest}  groundray\n".encode(),
        "plugins/groundray/scripts/groundray": (ROOT / "plugins/groundray/scripts/groundray").read_bytes(),
        ".agents/plugins/marketplace.json": (ROOT / ".agents/plugins/marketplace.json").read_bytes(),
        "plugins/groundray/plugin.json": (ROOT / "plugins/groundray/plugin.json").read_bytes(),
    }
    archive = release / f"groundray-{tag}-{_release_target()}.tar.gz"
    with tarfile.open(archive, "w:gz") as bundle:
        for name, data in files.items():
            entry = tarfile.TarInfo(name)
            entry.size = len(data)
            entry.mode = 0o755 if name.endswith(("/groundray", "/groundray")) else 0o644
            bundle.addfile(entry, io.BytesIO(data))
        if extra:
            entry = tarfile.TarInfo(extra)
            if extra.endswith("symlink"):
                entry.type = tarfile.SYMTYPE
                entry.linkname = "/tmp/outside"
            bundle.addfile(entry)
    checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
    checksums = release / "SHA256SUMS"
    checksums.write_text(f"{checksum}  {archive.name}\n")
    return checksums


@pytest.fixture
def host(tmp_path):
    releases = tmp_path / "releases"
    write_package(releases)
    log = tmp_path / "host-calls.jsonl"
    cli = tmp_path / "codex with spaces"
    cli.write_text(f"#!{sys.executable}\n" + '''
import json,os,sys
from pathlib import Path
args=sys.argv[1:]
with Path(os.environ['HOST_LOG']).open('a') as log:
    log.write(json.dumps({'args':args,'home':os.environ.get('HOME'),'codex_home':os.environ.get('CODEX_HOME')})+'\\n')
if args==['--version']: print('codex-cli fixture')
elif args==['features','list']: print('plugins stable '+('false' if os.environ.get('DISABLE_PLUGINS') else 'true'))
elif args[:2]==['plugin','add'] and os.environ.get('FAIL_ADD'): sys.exit(3)
elif args[:3]==['plugin','list','--marketplace'] and args[3]=='groundray-dev':
    print(json.dumps({'installed':[{'pluginId':'groundray@groundray-dev'}] if os.environ.get('LEGACY') else []}))
elif args[:3]==['plugin','list','--marketplace'] and args[3]=='groundray':
    print(json.dumps({'installed':[] if os.environ.get('HIDE_PLUGIN') else [{'pluginId':'groundray@groundray','enabled':True}]}))
else: print('{}')
''')
    cli.chmod(0o755)
    root = tmp_path / "persistent storage"
    profile = tmp_path / "original Codex profile"
    profile.mkdir()
    marker = profile / "unrelated-plugin-state"
    marker.write_bytes(b"Preserve this plugin state\r\n")
    config = tmp_path / "company" / "config.yaml"
    config.parent.mkdir()
    config.write_text("existing company/provider settings")
    environment = {key: value for key, value in os.environ.items() if not key.startswith("COV_CORE_")}
    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(QuietHandler, directory=str(releases))
    )
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    environment.update(GROUNDRAY_VERSION=__version__, GROUNDRAY_CODEX=str(cli),
                       GROUNDRAY_INSTALL_DIR=str(root), HOST_LOG=str(log), CODEX_HOME=str(profile),
                       XDG_CONFIG_HOME=str(config.parent),
                       GROUNDRAY_RELEASE_BASE_URL=f"http://127.0.0.1:{server.server_port}")

    def install(**updates):
        result = subprocess.run(["sh", "install-groundray"], cwd=ROOT,
                                env={**environment, **updates}, text=True, capture_output=True)
        assert marker.read_bytes() == b"Preserve this plugin state\r\n"
        assert config.read_text() == "existing company/provider settings"
        return result

    yield install, environment, root, releases, log
    server.shutdown()
    thread.join()
    server.server_close()


def test_install_and_upgrade_use_explicit_host_persistent_path_and_preserve_state(host):
    install, environment, root, releases, log = host
    result = install(LEGACY="1", GROUNDRAY_CLI="/does/not/exist")
    assert result.returncode == 0, result.stderr
    marketplace = root / "marketplace"
    assert (marketplace / ".groundray-install").read_text().strip() == f"v{__version__}"
    calls = [json.loads(line) for line in log.read_text().splitlines()]
    assert all(c['home'] == environment.get('HOME') and c['codex_home'] == environment['CODEX_HOME'] for c in calls)
    assert any(c['args'] == ['plugin','remove','groundray@groundray-dev','--json'] for c in calls)
    assert not any(c['args'][:3] == ['plugin','marketplace','remove'] for c in calls)
    helper = marketplace / "plugins/groundray/scripts/groundray"
    original = helper.read_bytes()
    result = install()
    assert result.returncode == 0, result.stderr
    assert helper.read_bytes() == original
    assert list(root.glob('.previous.*/plugins/groundray/scripts/groundray'))
    checksums = next(releases.glob('*/SHA256SUMS'))
    checksums.write_text(checksums.read_text().replace(checksums.read_text()[:64], '0'*64))
    assert install().returncode != 0
    assert helper.read_bytes() == original


@pytest.mark.parametrize('extra', ['/outside', 'plugins/groundray/../../outside', 'plugins/groundray/symlink'])
def test_unsafe_archive_never_registers_or_replaces_package(host, extra):
    install, _, root, releases, log = host
    write_package(releases, extra=extra)
    result = install()
    assert result.returncode != 0
    assert not (root / 'marketplace').exists()
    assert all(json.loads(line)['args'] in [['--version'], ['features','list']] for line in log.read_text().splitlines())


@pytest.mark.parametrize('options', [{'bad_runtime_hash': True}, {'runtime_version': '0.2.0'}])
def test_bad_runtime_or_release_version_leaves_existing_installation_intact(host, options):
    install, _, root, releases, _ = host
    assert install().returncode == 0
    helper = root / 'marketplace/plugins/groundray/scripts/groundray'
    original = helper.read_bytes()
    write_package(releases, **options)
    assert install().returncode != 0
    assert helper.read_bytes() == original


def test_host_failure_retains_verified_package_for_retry_and_refuses_unmanaged_overwrite(host):
    install, _, root, _, _ = host
    assert install(FAIL_ADD='1').returncode != 0
    assert (root / 'marketplace/plugins/groundray/runtime/groundray').exists()
    assert install().returncode == 0
    marker = root / 'marketplace/.groundray-install'
    marker.unlink()
    result = install()
    assert result.returncode != 0
    assert 'unmanaged marketplace' in result.stderr


def test_disabled_feature_and_empty_host_catalog_are_reported_as_failure(host):
    install, _, root, _, log = host
    result = install(DISABLE_PLUGINS='1')
    assert result.returncode != 0 and 'disabled or unsupported' in result.stderr
    assert not root.exists()
    result = install(HIDE_PLUGIN='1', LEGACY='1')
    assert result.returncode != 0 and 'not installed/enabled' in result.stderr
    assert not any(json.loads(line)['args'][:2] == ['plugin','remove'] for line in log.read_text().splitlines())
