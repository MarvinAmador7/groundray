"""Check packet honesty and native-run deadline/preservation boundaries."""
from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from zipfile import ZipFile

import pytest

from evals.groundray.pilot import prepare, probe_native
from scripts.build_groundray_plugin import ROOT


def prepared_case(tmp_path: Path):
    (tmp_path / 'bin').mkdir()
    (tmp_path / 'work').mkdir()
    (tmp_path / 'bin/shim.json').write_text(json.dumps({'product_environment': {}}))
    (tmp_path / 'work/native-prompt.txt').write_text('Use $groundray for a fictional question.\n')
    return tmp_path


def executable(tmp_path: Path, body: str):
    path = tmp_path / 'fake-codex'
    path.write_text(f'#!{sys.executable}\n' + body)
    path.chmod(0o755)
    return path


def test_native_response_alone_never_certifies_activation_and_prior_attempt_is_preserved(tmp_path):
    case = prepared_case(tmp_path)
    cli = executable(tmp_path, 'import json,sys\nsys.stdin.read()\nprint(json.dumps({"item":{"type":"agent_message","text":"Answer"}}))\n')
    result = probe_native(case, cli, 2)
    assert result['model_messages'] == 1
    assert result['activation_confirmed'] is False
    assert result['agent_cli_commands'] == 0
    events = (case / 'native-events.jsonl').read_bytes()
    with pytest.raises(ValueError, match='preserve'):
        probe_native(case, cli, 2)
    assert (case / 'native-events.jsonl').read_bytes() == events


def test_native_deadline_terminates_owned_client_and_preserves_environment(tmp_path):
    case = prepared_case(tmp_path)
    expected_home = os.environ.get('HOME')
    cli = executable(tmp_path, 'import os,time,sys\nfrom pathlib import Path\nsys.stdin.read()\n'
                     f'Path({str(tmp_path / "pid")!r}).write_text(str(os.getpid()))\n'
                     f'assert os.environ.get("HOME") == {expected_home!r}\n'
                     'print("HTTP 403 response endpoint blocked", flush=True)\ntime.sleep(120)\n')
    started = time.monotonic()
    result = probe_native(case, cli, 1)
    assert time.monotonic() - started < 6
    assert result['timed_out'] is True and result['blocked_by_http_403'] is False
    # A plain stdout line is retained, not silently parsed into a model event.
    assert 'HTTP 403' in (case / 'native-events.jsonl').read_text()
    with pytest.raises(ProcessLookupError):
        os.kill(int((tmp_path / 'pid').read_text()), 0)
    assert os.environ.get('HOME') == expected_home


def test_pilot_archive_contains_unchanged_sources_and_no_git_metadata_or_human_outcomes(tmp_path):
    output = tmp_path / 'packet'
    result = prepare(output, ROOT / 'plugins/groundray')
    assert result['human_participants'] == result['host_role_tests'] == 0
    assert json.loads((output / 'observations.json').read_text())['participants'] == []
    with ZipFile(output / 'groundray-pilot.zip') as z:
        assert all('.git' not in Path(n).parts for n in z.namelist())
        assert z.read('tools/provision_groundray_pilot.py') == (ROOT / 'scripts/provision_groundray_pilot.py').read_bytes()
        assert z.read('incoming/qa-update.txt') == (output / 'incoming/qa-update.txt').read_bytes()
        for name in z.namelist():
            if name.startswith('brain/knowledge/references/captures/'):
                expected = ROOT / 'examples/groundray-mosaic-cli' / name.removeprefix('brain/')
                assert z.read(name) == expected.read_bytes()
