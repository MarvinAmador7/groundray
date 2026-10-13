"""Plan an isolated private GitHub pilot; applying uses the operator's own login.

Cloud execution is not a replacement for employee credentials. No existing
repository is modified. A failed protection setup leaves a private, uninvited
repository for explicit operator recovery; it is never deleted or made public.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path


def fingerprints(root: Path) -> dict:
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(root.rglob('*')) if p.is_file() and '.git' not in p.parts}


def plan(repository: str, employee: str, packet: Path, *, publisher: str | None = None) -> dict:
    if not re.fullmatch(r'[A-Za-z0-9-]+/[A-Za-z0-9_.-]+', repository):
        raise ValueError('Use owner/repository')
    owner, name = repository.split('/')
    publisher = publisher or owner
    if not re.fullmatch(r'[A-Za-z0-9-]+', publisher):
        raise ValueError('Supply a publisher account handle')
    organization = owner.casefold() != publisher.casefold()
    if not name.startswith('groundray-pilot-'):
        raise ValueError('Use a dedicated groundray-pilot-* repository')
    if not re.fullmatch(r'[A-Za-z0-9-]+', employee) or employee.casefold() in {owner.casefold(), publisher.casefold()}:
        raise ValueError('Supply a distinct employee account')
    manifest = json.loads((packet / 'manifest.json').read_text())
    if manifest.get('synthetic') is not True:
        raise ValueError('Only a generated synthetic packet may be provisioned')
    brain = packet / 'brain'
    if brain.is_symlink() or any(p.is_symlink() for p in brain.rglob('*')):
        raise ValueError('Pilot inputs must not contain symlinks')
    if fingerprints(brain) != manifest.get('brain_fingerprints'):
        raise ValueError('Packet brain changed since preparation; do not publish it')
    return {'repository': repository, 'private': True, 'publisher': publisher,
            'repository_owner': owner, 'owner_type': 'Organization' if organization else 'User',
            'employee_contributor_and_receiver': employee,
            'distinct_read_only_account': None, 'packet': str(packet),
            'create_only_new_repository': True, 'human_pilot_completed': False,
            'main_policy': {'required_status_checks': None, 'enforce_admins': False,
                            'required_pull_request_reviews': {'required_approving_review_count': 1,
                                                             'dismiss_stale_reviews': True},
                            'restrictions': {'users': [publisher], 'teams': [], 'apps': []} if organization else None,
                            'allow_force_pushes': False,
                            'allow_deletions': False},
            'role_constraint': ('Employee writes proposal refs; protected main requires review. '
                                + ('Organization main writes are restricted to the named publisher; repository admins retain explicit bypass. '
                                   if organization else 'Personal repository owner retains admin bypass. ')
                                + 'Publisher admin may explicitly publish the reviewed exact draft. Host enforcement still needs actual negative attempts.'),
            'notification': 'Employee collaborator invitation is sent only by explicit --apply.',
            'host_plan_gate': 'Private branch protection may require a paid GitHub plan; stop before inviting on a policy error.'}


def apply(proposed: dict, packet: Path, log: Path) -> dict:
    if log.exists():
        raise ValueError('Use a new log file; preserve previous provisioning attempts')
    log.parent.mkdir(parents=True, exist_ok=True)
    log.touch()
    operations = []
    def run(argv: list[str], *, data=None, allowed=(0,)):
        r = subprocess.run(argv, input=json.dumps(data) if data is not None else None,
                           text=True, capture_output=True, timeout=180)
        record = {'argv': argv, 'exit_code': r.returncode, 'stdout': r.stdout,
                  'stderr': r.stderr, 'request': data}
        operations.append(record)
        with log.open('a') as file:
            file.write(json.dumps(record) + '\n')
        if r.returncode not in allowed:
            detail = r.stderr.strip()
            try:
                response = json.loads(r.stdout)
            except ValueError:
                response = None
            if isinstance(response, dict) and response.get('message'):
                detail = str(response['message'])
                if response.get('status'):
                    detail += ' (HTTP ' + str(response['status']) + ')'
            operation = ' '.join(argv[:3])
            raise RuntimeError(f'Operation refused: {operation}: {detail or "nonzero exit status"}. '
                               f'See {log}. No automatic recovery or invitation follows.')
        return r
    def api(endpoint, method='GET', data=None):
        argv = ['gh', 'api', endpoint, '--method', method]
        if data is not None:
            argv += ['--input', '-']
        return json.loads(run(argv, data=data).stdout)
    current = api('user')['login']
    owner, name = proposed['repository'].split('/')
    if current.casefold() != proposed['publisher'].casefold():
        raise ValueError('Use the named publisher account; no credential switching is performed')
    organization = proposed['owner_type'] == 'Organization'
    if organization and api('users/' + owner).get('type') != 'Organization':
        raise ValueError('A distinct repository owner must be an actual organization')
    api('users/' + proposed['employee_contributor_and_receiver'])
    # Require a structured HTTP 404. An auth/network error is never absence.
    existing = run(['gh', 'api', 'repos/' + proposed['repository']], allowed=(0, 1))
    if not existing.returncode:
        raise ValueError('Repository already exists; leave it unchanged')
    try:
        missing = json.loads(existing.stdout)
    except ValueError:
        raise ValueError('Repository absence not established; stop on the actual host error') from None
    if str(missing.get('status')) != '404':
        raise ValueError('Repository absence not established; stop on the actual host error')
    endpoint = 'orgs/' + owner + '/repos' if organization else 'user/repos'
    created = api(endpoint, 'POST', {'name': name, 'private': True,
                                        'description': 'Fictional Groundray two-employee pilot; no real company records',
                                        'auto_init': False})
    if created.get('private') is not True:
        raise RuntimeError('Host did not create a private repository; no seeding or invitation follows')
    if created.get('full_name', '').casefold() != proposed['repository'].casefold():
        raise RuntimeError('Host repository owner/name differs from the plan; no seeding or invitation follows')
    if organization:
        permissions = api('repos/' + proposed['repository']).get('permissions') or {}
        if permissions.get('admin') is not True:
            raise RuntimeError('Publisher repository admin permission not confirmed; no seeding or invitation follows')
    clone = log.parent / 'pilot-seed-clone'
    if clone.exists():
        raise ValueError('Seed clone already exists; repository remains private without invitation')
    run(['git', 'clone', created['clone_url'], str(clone)])
    for name in ['brain.yaml', 'knowledge']:
        src, dst = packet / 'brain' / name, clone / name
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copyfile(src, dst)
    run(['git', '-C', str(clone), 'checkout', '-b', 'main'])
    run(['git', '-C', str(clone), 'add', 'brain.yaml', 'knowledge'])
    run(['git', '-C', str(clone), 'commit', '-m', 'Seed explicitly fictional Groundray pilot'])
    run(['git', '-C', str(clone), 'push', 'origin', 'main'])
    base = run(['git', '-C', str(clone), 'rev-parse', 'HEAD']).stdout.strip()
    protection_endpoint = 'repos/' + proposed['repository'] + '/branches/main/protection'
    api(protection_endpoint, 'PUT', proposed['main_policy'])
    protection = api(protection_endpoint)
    reviews = protection.get('required_pull_request_reviews') or {}
    if reviews.get('required_approving_review_count', 0) < 1 or protection.get('enforce_admins', {}).get('enabled') is not False:
        raise RuntimeError('Expected owner/employee main boundary not confirmed; no invitation follows')
    if organization:
        restrictions = protection.get('restrictions') or {}
        writers = [u.get('login', '').casefold() for u in restrictions.get('users', [])]
        if (writers != [proposed['publisher'].casefold()] or restrictions.get('teams') != []
                or restrictions.get('apps') != []):
            raise RuntimeError('Named publisher main restriction not confirmed; no invitation follows')
    if (reviews.get('dismiss_stale_reviews') is not True
            or protection.get('allow_force_pushes', {}).get('enabled') is not False
            or protection.get('allow_deletions', {}).get('enabled') is not False):
        raise RuntimeError('Requested review/force-push/deletion protection not confirmed; no invitation follows')
    invite = api('repos/' + proposed['repository'] + '/collaborators/' + proposed['employee_contributor_and_receiver'],
                 'PUT', {'permission': 'push'})
    return {'repository': proposed['repository'], 'source_url': created['clone_url'],
            'base_commit': base, 'invitation_id': invite.get('id'),
            'invitation_accepted': None, 'actual_employee_negative_attempts': 0,
            'human_sessions_completed': 0, 'host_policy_received': protection}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', default='MarvinAmador7/groundray-pilot-mosaic')
    parser.add_argument('--employee', default='KarolGarcia712')
    parser.add_argument('--publisher', help='Authenticated publisher handle; defaults to the owner for personal repositories')
    parser.add_argument('--packet', type=Path, required=True)
    parser.add_argument('--apply', action='store_true', help='Create/seed/protect a new private repository and send the employee invitation')
    parser.add_argument('--log', type=Path)
    args = parser.parse_args()
    try:
        proposed = plan(args.repository, args.employee, args.packet.resolve(), publisher=args.publisher)
        if args.apply:
            if args.log is None:
                parser.error('--apply requires a new --log path')
            print(json.dumps(apply(proposed, args.packet.resolve(), args.log.resolve())))
        else:
            print(json.dumps(proposed, indent=2))
    except (ValueError, RuntimeError) as error:
        parser.exit(1, f'error: {error}\n')
