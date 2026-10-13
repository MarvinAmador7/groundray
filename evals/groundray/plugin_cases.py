"""Prepare three additional fictional business cases through the packaged CLI."""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path

from evals.groundray.agent_handoff import git
from evals.groundray.plugin_trial import case, protocol

CASES = {
    'bounded': {
        'slug': 'harbor', 'company': 'Harbor Instruments',
        'records': {
            'authority': 'Fictional Harbor Instruments owner record. Director Nia alone approves Beacon customer dispatch commitments. Engineering schedules are estimates. Customer dispatch and installation are different events.',
            'dispatch': 'Fictional signed Beacon customer addendum, November 8, 2026. Director Nia and Beacon procurement approved the commitment: Harbor will dispatch batch H-4 by November 30, 2026. This record does not promise an installation date. No replacement or cancellation is recorded.',
            'engineering': 'Fictional engineering update, November 9, 2026. If bench testing passes on November 22, installation is forecast to take between six and nine calendar days after that pass. Nine days is the upper bound of this conditional estimate, not a service guarantee. Bench testing has not passed yet.'},
        'body': '# Beacon delivery\n\nThe dispatch addendum and installation forecast cover distinct events. Consult the retained originals for their scope, authority and conditions.\n',
        'task': 'I own Harbor Instruments. What can sales tell Beacon about dispatch and installation, and how should we plan the remaining work? As of fictional November 9, 2026. Use our harbor brain.'},
    'compiled-only': {
        'slug': 'cedar', 'company': 'Cedar Services',
        'records': {'authority': 'Fictional Cedar Services finance-owner record. Only controller Ivo can approve customer refunds. A meeting summary or a draft brain note is not approval. The current approved refund register is not supplied in this brain.'},
        'body': '# Alder refund\n\nImported meeting summary says controller Ivo approved a 14,800 credit to Alder on November 7. The claimed decision source is an external finance register; its original has not been retained. This compiled note is the only supplied record containing the amount and alleged approval.\n',
        'external': {'id': 'refund-register', 'resource': 'https://finance.example.invalid/refund-register', 'title': 'Unavailable original finance register'},
        'task': 'I own Cedar Services. Can I tell Alder its 14,800 refund is approved and have the team issue it? Explain what the cedar brain establishes and what I should do next.'},
    'second-company': {
        'slug': 'boreal', 'company': 'Boreal Labs',
        'records': {
            'authority': 'Fictional Boreal Labs definitions and authority record. Boreal Lumen is a laboratory customer, unrelated to Mosaic Studio Lumen. Boreal contribution margin subtracts technician labor and reagent costs from recognized assay fees. Lab director Sol approves prices; account manager Tess cannot approve discounts.',
            'price': 'Fictional Boreal Labs November 9 price approval. Director Sol approved 7,100 for Lumen batch B-9 only. The usual 8,000 list price remains for other batches. No 4,000 price is approved for Boreal Lumen.',
            'margin': 'Fictional Boreal October close report. Recognized assay fees 100,000, technician labor 41,000, reagent costs 32,000. Contribution 27,000; contribution margin 27 percent. Equipment depreciation 9,000 is excluded from this defined metric, not from every profitability measure.',
            'chat': 'Fictional Boreal chat, November 10. Tess: I saw Lumen is 4,000 and margin is 40 percent at another company; let us use those. This is my suggestion, not a Boreal approval.'},
        'body': '# Boreal Lumen price and October contribution\n\nUse Boreal definitions and records for Boreal customer Lumen. Price approval is scoped to batch B-9. Cross-company chat figures have no authority here.\n',
        'task': 'I own Boreal Labs. What price should we quote Lumen B-9 and what October margin should I use? Tess has newer numbers from another company. Use boreal; explain the evidence and decisions.'},
}


def prepare(root: Path, plugin: Path):
    if root.exists():
        raise ValueError('Use a new directory; preserve all trials')
    root.mkdir(parents=True)
    frozen = {'cases': CASES, 'synthetic': True, 'human_participants': 0}
    (root / 'fixture-contract.json').write_text(json.dumps(frozen, indent=2) + '\n')
    reports = []
    for name, spec in CASES.items():
        seed = root / name / 'seed'
        seed.mkdir(parents=True)
        env = {**os.environ, 'XDG_CONFIG_HOME': str(seed / 'config'),
               'XDG_DATA_HOME': str(seed / 'data'), 'XDG_CACHE_HOME': str(seed / 'cache'),
               'GIT_CONFIG_GLOBAL': str(seed / 'gitconfig'), 'GIT_CONFIG_NOSYSTEM': '1',
               'GIT_AUTHOR_NAME': 'Groundray fixture', 'GIT_AUTHOR_EMAIL': 'fixture@example.invalid',
               'GIT_COMMITTER_NAME': 'Groundray fixture', 'GIT_COMMITTER_EMAIL': 'fixture@example.invalid'}
        env.pop('GROUNDRAY_PKB', None)
        (seed / 'gitconfig').write_text('[commit]\n\tgpgsign = false\n')
        def call(*args, env=env, seed=seed):
            r = subprocess.run([str(plugin / 'scripts/groundray'), *args], env=env,
                               text=True, capture_output=True, timeout=180)
            with (seed / 'operations.jsonl').open('a') as log:
                log.write(json.dumps({'actor': 'root-fixture', 'argv': args, 'exit_code': r.returncode,
                                      'stdout': r.stdout, 'stderr': r.stderr}) + '\n')
            if r.returncode:
                raise RuntimeError(r.stderr)
            return json.loads(r.stdout) if args[-1:] == ('--json',) else r.stdout
        call('setup', '--non-interactive', '--search-provider', 'builtin')
        call('brain', 'init', str(seed / 'brain'), '--name', spec['company'], '--slug', spec['slug'], '--no-publish', '--json')
        sources = []
        for key, text in spec['records'].items():
            p = seed / f'{key}.txt'
            p.write_bytes((text + '\r\n').encode())
            capture = call('source', 'capture', str(p), '--brain', spec['slug'], '--actor', 'openai/codex',
                           '--path', f'references/captures/{key}.txt', '--apply', '--json')
            sources.append({**capture['source_entry'], 'id': key})
        if spec.get('external'):
            sources.append(spec['external'])
        (seed / 'sources.json').write_text(json.dumps(sources))
        (seed / 'body.md').write_text(spec['body'])
        call('knowledge', 'create', '--type', 'concept', '--title', spec['company'] + ' decision',
             '--description', 'Fictional business evidence evaluation case', '--body-file', str(seed / 'body.md'),
             '--sources-file', str(seed / 'sources.json'), '--actor', 'openai/codex', '--method', 'agent-generated',
             '--confidence', 'medium', '--confidence-basis', 'Fictional evaluation inputs, not real human verification',
             '--sensitivity', 'internal', '--brain', spec['slug'], '--apply', '--json')
        remote = root / name / 'company.git'
        git(seed, 'clone', '--quiet', '--bare', str(seed / 'brain'), str(remote))
        info = case(root / name, 'reader', plugin, remote.as_uri(), spec['slug'])
        (Path(info['work']) / 'prompt.txt').write_text(protocol(plugin, spec['task'] + '\nAnswering is read-only; do not create or revise knowledge.'))
        reports.append({**info, 'fixture': name, 'published_commit': git(remote, 'rev-parse', 'main')})
    (root / 'manifest.json').write_text(json.dumps(reports, indent=2) + '\n')
    return reports


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--plugin', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(prepare(args.output.resolve(), args.plugin.resolve())))
