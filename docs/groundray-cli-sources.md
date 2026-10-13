# Mosaic brain using supported source commands

**Original records can now be captured and inspected through the CLI.** This
follow-up replaces the manual copying and development reader in the first
[engine-fit demonstration](groundray-engine-fit.md). Implementation is on the
draft branch; no tagged release or Groundray plugin is published.

The [saved Mosaic snapshot](../examples/groundray-mosaic-cli/README.md) preserves
the resulting files and source receipts. The unchanged fictional Mosaic packet
supplies 21 original records. Three
root-authored wiki pages explain pricing, October contribution margin and
launch/Tint scope. The harness runs the actual source-tree CLI and native sidecar
with isolated local author/reader configurations on one Linux host. It calls no
model, obtains no human review and does not exercise remote permissions or a
protected proposal/review flow.

## Observed workflow

- `source capture` plans then explicitly saves all 21 originals, recording copy
  provenance, matching hashes, preservation rules and log entries. No source
  bytes or unknown original metadata are rewritten.
- The existing knowledge planner creates three linked drafts, with honest
  agent authorship, normal source links and no human verification.
- Another isolated configuration independently installs the same Git version.
  All 21 original hashes match; direct source reads check their receipts.
- Twelve item-scoped source reads across ten files recover the actual originals
  behind the selected explanations, with matching source/context commit citations.
- Native discovery retrieves pricing, margin and launch pages. A material
  clarification preserves item identity and earlier reasoning, then reaches the
  other installation through explicit sync.
- Search refuses the old index after sync; an explicit rebuild restores it.

The recorded CLI construction contains 180 commands, including mechanical fixture
checks, source plans/applies, full source reads and Git-history inspection. Two
nonzero exits are intentional: `pkb get` remains concept/document-only and refuses
a raw CSV; search refuses a stale index. Raw CSV reading succeeds through
`pkb source get`. This count is instrumentation, not employee effort or a comparison
with the earlier manual fixture setup.

The [result and recorded command traces](../evals/groundray/results/2026-10-12-groundray-cli-sources-v1/result.json)
separate the initial successful construction from final implementation validation.
These are mechanical runs, not agent participants or accuracy trials. They do not
establish Lite activation, creation/maintenance behavior, real source authenticity,
actual employee benefit or general reliability.

## Reproduce

From a development checkout with `.[dev]` installed and a built native sidecar:

```bash
python -m evals.groundray.engine_fit --cli-sources \
  --output /tmp/groundray-cli-sources-new \
  --native-command /absolute/path/to/pkb-search
```

Choose a new output path. The harness never overwrites a prior construction. Its
company repository, isolated configurations, saved source receipts, bundle snapshot,
result and full command trace remain available for inspection. Generated identities
and timestamps differ across constructions. The earlier G0 fixture-copy mode and
its published traces remain available without the `--cli-sources` flag.

No global installation, skill activation, repository publication or model call is
needed. New commands ship only after a separately prepared release. See
[source capture](source-capture.md) for ordinary command usage, limits and recovery.

## Remaining integration

The source capture/read gap is implemented. Remote-installed authoring still needs
a supported local authoring attachment/proposal workflow. Next, exercise that
workflow against a shared test remote with explicit review/publication, version
integrity and refusal cases, then validate Lite through the integrated interface.
Same-host isolation does not demonstrate distinct computers or platform coverage.

The [Groundray goal](groundray-product-goal.md) retains these as G0/G1 integration
gates. Neither capture receipts nor a valid KB file turn a saved opinion into a
business fact; the agent must still inspect sources, company definitions and scope.

The next [employee handoff demonstration](groundray-employee-handoff.md)
exercises authoring attachment and reviewed proposal publication through a shared
local bare Git remote. The limitations above describe this source-only study;
fresh agent behavior and real host permissions remain untested in both.
