"""Mechanical observer audit; no automatic semantic accuracy or authority score."""
from __future__ import annotations

import json
from pathlib import Path

from evals.groundray.agent_handoff import snapshot
from evals.groundray.agent_handoff_audit import inspect_answer_links
from evals.groundray.engine_fit import digest


def audit_case(case: Path, plugin: Path) -> dict:
    events = [json.loads(s)['item'] for s in (case / 'events.jsonl').read_text().splitlines()]
    traces = [json.loads(p.read_text()) for p in sorted((case / 'trace').glob('*.json'))]
    traces = [t for t in traces if t['actor'] == 'agent']
    observed = '\n'.join(e['aggregated_output'] for e in events if e['exit_code'] == 0)
    sources = []
    for t in traces:
        if t['exit_code']:
            continue
        try:
            payload = json.loads(t['stdout'])
        except ValueError:
            continue
        s = payload.get('source')
        if isinstance(s, dict) and isinstance(s.get('content'), str):
            sources.append({'path': s['path'], 'sha256': s['sha256'],
                            'commit': payload['citation']['commit'], 'local_path': s.get('local_path'),
                            'content': s['content'], 'command': t['argv'][:2],
                            'complete_body_in_observer_output': s['content'] in observed
                            or json.dumps(s['content']) in observed
                            or json.dumps(s['content'], ensure_ascii=False) in observed})
    answer = case / 'work/response/answer.md'
    final = json.loads((case / 'final.json').read_text())
    return {'runner': json.loads((case / 'runner.json').read_text()),
            'shell_commands': len(events), 'shell_nonzero_exits': sum(e['exit_code'] != 0 for e in events),
            'cli_commands': len(traces), 'cli_errors': [{'argv': t['argv'], 'stderr': t['stderr'], 'exit_code': t['exit_code']} for t in traces if t['exit_code']],
            'returned_sources': sources, 'distinct_returned_sources': len({s['path'] for s in sources}),
            'local_source_links': inspect_answer_links(case, answer, sources),
            'answer_words': len(answer.read_text().split()),
            'answer_matches_final': answer.read_text() == final.get('answer'),
            'installed_skill_reads': {p: (plugin / p).read_text() in observed for p in
                                     ['skills/groundray/SKILL.md', 'skills/groundray-setup/SKILL.md',
                                      'skills/groundray/references/portable-kb/SKILL.md']},
            'runtime_sha256': digest(plugin / 'runtime/pkb'),
            'artifacts': final.get('artifacts', {})}


def audit_inputs(case: Path, info: dict) -> dict:
    slug = info['slug']
    installed = case / 'data/portable-kb/brains' / slug
    return {'installed_files_unchanged': snapshot(installed) == info['installed_snapshot']}
