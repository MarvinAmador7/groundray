"""Prepare a synthetic employee pilot and bound an opt-in native Codex attempt.

No invitations, credential changes, hosted repository mutations or human outcomes
are inferred. Prepared observations remain blank until a person supplies them.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import signal
import subprocess
import time
import zipfile
from contextlib import suppress
from pathlib import Path

from evals.groundray.agent_handoff import NEW_QA, QUESTION, git, snapshot
from evals.groundray.engine_fit import ROOT


def write(path: Path, value: dict):
    path.write_text(json.dumps(value, indent=2) + '\n')


def prepare(output: Path, plugin: Path, *, publisher: str | None = None,
            employee: str | None = None, repository: str | None = None) -> dict:
    if output.exists() or output.is_symlink():
        raise ValueError('Use a new output directory; preserve prior pilot records')
    plugin_manifest = json.loads((plugin / 'plugin.json').read_text())
    if plugin_manifest.get('name') != 'groundray':
        raise ValueError('Choose the Groundray plugin')
    output.mkdir(parents=True)
    fixture = ROOT / 'examples/groundray-mosaic-cli'
    shutil.copytree(fixture, output / 'brain')
    git(output / 'brain', 'init', '--quiet', '--initial-branch=main')
    git(output / 'brain', 'add', 'brain.yaml', 'knowledge')
    git(output / 'brain', 'commit', '--quiet', '-m', 'Seed explicitly fictional employee pilot')
    (output / 'incoming').mkdir()
    (output / 'incoming/qa-update.txt').write_bytes(NEW_QA.encode())
    (output / 'prompts').mkdir()
    prompts = {
        'owner': 'Use $groundray. ' + QUESTION,
        'contributor': 'Use $groundray. ' + QUESTION + '\nQA supplied incoming/qa-update.txt. Retain that original, update current launch understanding and actual dependents, and prepare a proposal for review. Keep earlier evidence. Do not publish main. Report proposal name, full candidate commit and base.',
        'reviewer': 'Use $groundray to inspect the mosaic-studio proposal PROPOSAL_NAME at full commit CANDIDATE_COMMIT. Assess the retained evidence, scope and draft publication. Report exact candidate/base inspected and company decisions still open. Do not publish, activate, or record human verification. Replace placeholders with the actual contributor handoff before starting.',
        'reader': 'Use $groundray. Explicitly sync the published mosaic-studio brain and answer: ' + QUESTION + ' Inspect consequential originals and give a direct answer, evidence and guidance. Answering is read-only except authorized sync/index recovery.',
    }
    for role, text in prompts.items():
        (output / f'prompts/{role}.txt').write_text(text + '\n')
    write(output / 'roles.json', {'repository': repository, 'source_url': None,
                                  'contributor_account': employee, 'publisher_account': publisher,
                                  'receiver_account': employee, 'read_only_account': None, 'host_main_ref': 'refs/heads/main',
                                  'permissions_checked': False, 'native_sessions_completed': False})
    write(output / 'observations.json', {'participants': [], 'permission_attempts': [],
                                        'notes': 'Empty template; no actual people or hosted-role tests yet.'})
    write(output / 'session-template.json', {'participant': None, 'os': None,
                                           'codex_version': None, 'plugin_version': None,
                                           'installed_commit': None, 'question': None,
                                           'answer': None, 'opened_evidence_links': [],
                                           'source_passages_inspected': [], 'human_reaction': None,
                                           'active_minutes': None, 'errors': [],
                                           'proposal': None, 'candidate_commit': None,
                                           'base_commit': None, 'publication_outcome': None})
    shutil.copyfile(ROOT / 'docs/groundray-pilot.md', output / 'README.md')
    (output / 'tools').mkdir()
    shutil.copyfile(ROOT / 'scripts/provision_groundray_pilot.py', output / 'tools/provision_groundray_pilot.py')
    manifest = {'synthetic': True, 'human_participants': 0, 'host_role_tests': 0,
                'source': 'Existing fictional Mosaic Studio fixture; no private company records',
                'local_seed_commit': git(output / 'brain', 'rev-parse', 'HEAD'),
                'brain_slug': 'mosaic-studio',
                'plugin_version': plugin_manifest['version'],
                'plugin_fingerprints': snapshot(plugin),
                'brain_fingerprints': snapshot(output / 'brain'),
                'incoming_sha256': hashlib.sha256(NEW_QA.encode()).hexdigest(),
                'prompt_sha256': {role: hashlib.sha256((output / f'prompts/{role}.txt').read_bytes()).hexdigest() for role in prompts},
                'archive_excludes_git_metadata': True}
    write(output / 'manifest.json', manifest)
    archive = output / 'groundray-pilot.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for p in sorted(output.rglob('*')):
            if p.is_file() and '.git' not in p.relative_to(output).parts and p != archive:
                bundle.write(p, p.relative_to(output).as_posix())
    write(output / 'archive.json', {'file': archive.name,
                                   'sha256': hashlib.sha256(archive.read_bytes()).hexdigest()})
    return manifest


def probe_native(case: Path, codex: Path, timeout: int) -> dict:
    if not 1 <= timeout <= 300:
        raise ValueError('Native attempt deadline must be 1–300 seconds')
    if any((case / n).exists() for n in ['native-events.jsonl', 'native-stderr.txt', 'native-result.json']):
        raise ValueError('Native attempt already exists; preserve the original session')
    config = json.loads((case / 'bin/shim.json').read_text())
    prompt = (case / 'work/native-prompt.txt').read_text()
    env = {**os.environ, **config['product_environment'], 'PKB_EVAL_ACTOR': 'agent'}
    argv = [str(codex), 'exec', '--ephemeral', '--json', '--sandbox', 'workspace-write',
            '--add-dir', str(case), '--skip-git-repo-check', '-C', str(case / 'work'),
            '--output-last-message', str(case / 'native-answer.md'), '-']
    started = time.monotonic()
    timed_out = False
    with (case / 'native-events.jsonl').open('w') as stdout, (case / 'native-stderr.txt').open('w') as stderr:
        process = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=stdout, stderr=stderr,
                                   env=env, text=True, start_new_session=True)
        try:
            process.communicate(prompt, timeout=timeout)
        except subprocess.TimeoutExpired:
            timed_out = True
            with suppress(ProcessLookupError):
                os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                with suppress(ProcessLookupError):
                    os.killpg(process.pid, signal.SIGKILL)
                process.wait()
    events = []
    for line in (case / 'native-events.jsonl').read_text().splitlines():
        with suppress(ValueError):
            events.append(json.loads(line))
    messages = [e for e in events if e.get('item', {}).get('type') == 'agent_message']
    commands = [e for e in events if e.get('item', {}).get('type') == 'command_execution']
    error_text = (case / 'native-stderr.txt').read_text()
    trace = [json.loads(p.read_text()) for p in sorted((case / 'trace').glob('*.json'))]
    agent_cli = [t for t in trace if t['actor'] == 'agent']
    result = {'argv': argv, 'exit_code': process.returncode, 'timed_out': timed_out,
              'elapsed_seconds': round(time.monotonic() - started, 2),
              'model_messages': len(messages), 'native_commands': len(commands),
              'agent_cli_commands': len(agent_cli),
              'blocked_by_http_403': '403' in error_text or any('403' in json.dumps(e) for e in events),
              'activation_confirmed': False,
              'activation_notes': 'Automatic activation requires manual inspection of native skill discovery, command and answer evidence; a response alone is insufficient.',
              'prompt_sha256': hashlib.sha256(prompt.encode()).hexdigest(),
              'auth_home_proxy_preserved': True}
    write(case / 'native-result.json', result)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    prep = commands.add_parser('prepare')
    prep.add_argument('--output', type=Path, required=True)
    prep.add_argument('--plugin', type=Path, required=True)
    prep.add_argument('--publisher')
    prep.add_argument('--employee')
    prep.add_argument('--repository')
    probe = commands.add_parser('probe-native')
    probe.add_argument('--case', type=Path, required=True)
    probe.add_argument('--codex', type=Path, default=Path('/opt/codex/bin/codex'))
    probe.add_argument('--timeout', type=int, default=45)
    args = parser.parse_args()
    if args.command == 'prepare':
        print(json.dumps(prepare(args.output.resolve(), args.plugin.resolve(), publisher=args.publisher, employee=args.employee, repository=args.repository)))
    else:
        print(json.dumps(probe_native(args.case.resolve(), args.codex, args.timeout)))
