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


@pytest.mark.parametrize('host_message', [
    'Upgrade to GitHub Pro or make this repository public to enable this feature.',
    'Resource not accessible by integration',
])
def test_failed_private_branch_protection_never_sends_invitation(tmp_path, monkeypatch, host_message):
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
            body, code = '{"private":true,"full_name":"MarvinAmador7/groundray-pilot-mosaic","clone_url":"https://github.com/MarvinAmador7/groundray-pilot-mosaic.git"}', 0
        elif '/protection' in endpoint:
            body, code = json.dumps({'status': '403', 'message': host_message}), 1
        elif endpoint.startswith('repos/') and method == 'GET':
            body, code = '{"status":"404"}', 1
        else:
            body, code = '{}', 0
        return subprocess.CompletedProcess(argv, code, body, '')
    (root / 'brain/knowledge').mkdir()
    monkeypatch.setattr('scripts.provision_groundray_pilot.subprocess.run', fake)
    with pytest.raises(RuntimeError, match='refused') as failure:
        apply(p, root, tmp_path / 'no-private-protection.jsonl')
    assert host_message in str(failure.value)
    assert 'HTTP 403' in str(failure.value)
    assert '/branches/main/protection' in str(failure.value)
    assert not any(any('/collaborators/' in value for value in argv) for argv in calls)


@pytest.mark.parametrize('failure', [None, 'owner_type', 'returned_owner', 'admin', 'restriction', 'policy'])
def test_organization_uses_named_publisher_and_invites_only_after_verified_policy(tmp_path, monkeypatch, failure):
    root = packet(tmp_path)
    (root / 'brain/knowledge').mkdir()
    p = plan('fullkontrol/groundray-pilot-mosaic', 'KarolGarcia712', root, publisher='MarvinAmador7')
    assert p['publisher'] == 'MarvinAmador7' and p['repository_owner'] == 'fullkontrol'
    assert p['main_policy']['restrictions']['users'] == ['MarvinAmador7']
    with pytest.raises(ValueError, match='distinct'):
        plan('fullkontrol/groundray-pilot-mosaic', 'KarolGarcia712', root, publisher='KarolGarcia712')
    calls = []
    created = False

    def fake(argv, *, input, **kwargs):
        nonlocal created
        calls.append(argv)
        if argv[0] == 'git':
            if argv[1] == 'clone':
                Path(argv[-1]).mkdir()
            return subprocess.CompletedProcess(argv, 0, 'a' * 40 if 'rev-parse' in argv else '', '')
        endpoint = argv[2]
        method = argv[argv.index('--method') + 1] if '--method' in argv else 'GET'
        code = 0
        if endpoint == 'user':
            body = {'login': 'MarvinAmador7'}
        elif endpoint == 'users/fullkontrol':
            body = {'type': 'User' if failure == 'owner_type' else 'Organization'}
        elif endpoint == 'orgs/fullkontrol/repos':
            created = True
            body = {'private': True, 'full_name': ('other/groundray-pilot-mosaic' if failure == 'returned_owner'
                                                  else 'fullkontrol/groundray-pilot-mosaic'),
                    'clone_url': 'https://github.com/fullkontrol/groundray-pilot-mosaic.git'}
        elif endpoint == 'repos/fullkontrol/groundray-pilot-mosaic':
            if not created:
                body, code = {'status': '404'}, 1
            else:
                body = {'permissions': {'admin': failure != 'admin'}}
        elif '/protection' in endpoint:
            body = {'required_pull_request_reviews': {'required_approving_review_count': 1,
                                                      'dismiss_stale_reviews': True},
                    'enforce_admins': {'enabled': False},
                    'allow_force_pushes': {'enabled': failure == 'policy'},
                    'allow_deletions': {'enabled': False},
                    'restrictions': {'users': [{'login': 'KarolGarcia712' if failure == 'restriction' else 'MarvinAmador7'}],
                                     'teams': [], 'apps': []}}
            if method == 'PUT':
                assert json.loads(input) == p['main_policy']
        elif '/collaborators/' in endpoint:
            body = {'id': 42}
        else:
            body = {}
        return subprocess.CompletedProcess(argv, code, json.dumps(body), '')

    monkeypatch.setattr('scripts.provision_groundray_pilot.subprocess.run', fake)
    if failure:
        with pytest.raises((ValueError, RuntimeError)):
            apply(p, root, tmp_path / 'organization.jsonl')
    else:
        result = apply(p, root, tmp_path / 'organization.jsonl')
        assert result['invitation_id'] == 42
        assert result['base_commit'] == 'a' * 40
    invitations = [argv for argv in calls if any('/collaborators/' in v for v in argv)]
    assert len(invitations) == (0 if failure else 1)
    assert not any('user/repos' in argv for argv in calls)
