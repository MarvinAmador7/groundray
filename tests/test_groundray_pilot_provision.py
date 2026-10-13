"""Test fail-closed plans and operator identity/repository guards; no network."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

from evals.groundray.agent_handoff import snapshot
from scripts.provision_groundray_pilot import apply, plan


def packet(tmp_path):
    root = tmp_path / 'packet'
    (root / 'brain').mkdir(parents=True)
    (root / 'brain/brain.yaml').write_text('Synthetic placeholder, not a real brain')
    (root / 'manifest.json').write_text(json.dumps({'synthetic': True, 'brain_fingerprints': snapshot(root / 'brain')}))
    return root


def test_plan_limits_repository_scope_and_detects_changed_packet(tmp_path):
    root = packet(tmp_path)
    p = plan('MarvinAmador7/groundray-pilot-mosaic', 'KarolGarcia712', root)
    assert p['private'] is True and p['human_pilot_completed'] is False
    assert p['distinct_read_only_account'] is None
    with pytest.raises(ValueError, match='dedicated'):
        plan('MarvinAmador7/portable-kb', 'KarolGarcia712', root)
    (root / 'brain/extra-private-notes.txt').write_text('Never seed this by accident')
    with pytest.raises(ValueError, match='changed'):
        plan('MarvinAmador7/groundray-pilot-mosaic', 'KarolGarcia712', root)


def test_apply_cannot_modify_existing_repo_or_treat_403_as_absence(tmp_path, monkeypatch):
    root = packet(tmp_path)
    p = plan('MarvinAmador7/groundray-pilot-mosaic', 'KarolGarcia712', root)
    for name, code, body in [('existing', 0, '{}'), ('forbidden', 1, '{"status":"403"}')]:
        calls = []
        def fake(argv, *, input, calls=calls, code=code, body=body, **kwargs):
            calls.append(argv)
            endpoint = argv[2]
            output = '{"login":"MarvinAmador7"}' if endpoint == 'user' else '{}'
            return subprocess.CompletedProcess(argv, code if endpoint.startswith('repos/') else 0,
                                               body if endpoint.startswith('repos/') else output, '')
        monkeypatch.setattr('scripts.provision_groundray_pilot.subprocess.run', fake)
        with pytest.raises(ValueError, match='exists|absence'):
            apply(p, root, tmp_path / f'{name}.jsonl')
        assert all(argv[argv.index('--method') + 1] == 'GET' for argv in calls if '--method' in argv)
        assert len(calls) == 3


def test_wrong_operator_account_stops_before_creating_repo_or_inviting(tmp_path, monkeypatch):
    root = packet(tmp_path)
    p = plan('MarvinAmador7/groundray-pilot-mosaic', 'KarolGarcia712', root)
    calls = []
    def fake(argv, **kwargs):
        calls.append(argv)
        return subprocess.CompletedProcess(argv, 0, '{"login":"SomeoneElse"}', '')
    monkeypatch.setattr('scripts.provision_groundray_pilot.subprocess.run', fake)
    with pytest.raises(ValueError, match='publisher'):
        apply(p, root, tmp_path / 'wrong-account.jsonl')
    assert len(calls) == 1


def test_failed_private_branch_protection_never_sends_invitation(tmp_path, monkeypatch):
    root = packet(tmp_path)
    p = plan('MarvinAmador7/groundray-pilot-mosaic', 'KarolGarcia712', root)
    calls = []
    def fake(argv, *, input, **kwargs):
        calls.append(argv)
        if argv[0] == 'git':
            if argv[1] == 'clone':
                Path(argv[-1]).mkdir()
            return subprocess.CompletedProcess(argv, 0, 'a' * 40 if 'rev-parse' in argv else '', '')
        endpoint = argv[2]
        method = argv[argv.index('--method') + 1] if '--method' in argv else 'GET'
        if endpoint == 'user':
            body, code = '{"login":"MarvinAmador7"}', 0
        elif endpoint == 'user/repos':
            body, code = '{"private":true,"clone_url":"https://github.com/MarvinAmador7/groundray-pilot-mosaic.git"}', 0
        elif '/protection' in endpoint:
            body, code = '{"status":"403"}', 1
        elif endpoint.startswith('repos/') and method == 'GET':
            body, code = '{"status":"404"}', 1
        else:
            body, code = '{}', 0
        return subprocess.CompletedProcess(argv, code, body, '')
    (root / 'brain/knowledge').mkdir()
    monkeypatch.setattr('scripts.provision_groundray_pilot.subprocess.run', fake)
    with pytest.raises(RuntimeError, match='refused'):
        apply(p, root, tmp_path / 'no-private-protection.jsonl')
    assert not any(any('/collaborators/' in value for value in argv) for argv in calls)
