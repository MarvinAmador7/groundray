# Groundray employee handoff: mechanical development demonstration

**Recorded October 13, 2026.** The draft CLI can attach an authoring clone to a
URL-installed brain and carry a retained-source/page update through proposal,
exact-version inspection, publication and explicit reader sync. This closes the
remote-authoring interface gap identified in the source-only G0 study. It does
not complete the agent, human-review, real-host or separate-computer gates of G1.

## What ran

The harness creates a real Git repository from the earlier saved
[Mosaic CLI snapshot](../examples/groundray-mosaic-cli), containing three linked
draft pages and 21 original captures with copy receipts. This is fixture setup,
not a general importer. It creates a shared bare Git repository and independently
installs its `file://` source into two configurations on one Linux host.

Through CLI commands, the author previews/attaches a separate clean clone,
previews/saves a new CRLF text source, and previews/saves a material update to the
Lumen launch page with a declared source. It adds a reminder that the synthetic
operations note repeats conditional rollout, without establishing client approval.
The author then previews/submits `groundray/delivery-evidence`. Published main
remains at its old commit until a publisher explicitly accepts the inspected
commit and base. Inspection uses the reader installation without an authoring
clone and leaves that installation at its old pin. Publication also leaves it
there until explicit sync.

After sync, complete-item and declared-original retrieval use the new pin. The
old native keyword index refuses queries; an explicit rebuild restores discovery.
The changed page preserves its UUID and honest `openai/codex` producer, remains a
draft and gains no human verification. All 21 older originals remain byte-identical,
the new CRLF source matches its receipt hash, and the earlier page body remains
readable at its historical commit.

The final construction completed **37 commands, with seven expected refusals**:

- Attaching a dirty authoring clone preserved its unfinished file.
- Reusing an existing proposal name left that proposal intact.
- Inspecting a proposal using the wrong full commit refused the moved-version mismatch.
- Accepting with the wrong reviewed base refused publication.
- A fixture receive hook denied publication and left main unchanged.
- Syncing a dirty installed checkout preserved its local notes.
- Searching with the old index after sync refused until a rebuild.

The receive hook is a local simulation. Both configurations use the same host
identity and filesystem; this is not a test of employee credentials, protected
GitHub branches or cross-platform installations. The publisher action is
fixture automation, not a recorded human review or business approval.

## Evidence and reproduction

The [result](../evals/groundray/results/2026-10-13-groundray-employee-handoff-v1/result.json)
records version IDs, retained hashes, code fingerprints and assertions. The
[final trace](../evals/groundray/results/2026-10-13-groundray-employee-handoff-v1/final-trace.json)
contains all commands and outputs, including refusals. Two earlier completed
mechanical construction traces/results remain in that directory. The second
construction overlapped code hardening; its end-of-run fingerprint cannot prove
which loaded module version ran. The third ran after code changes and its saved
fingerprints match the current implementation. No model trials were run or selected.

Reproduce from a development checkout with dependencies and the native sidecar:

```sh
PYTHONPATH=src python -m evals.groundray.employee_handoff \
  --output /tmp/groundray-handoff-new \
  --native-command /absolute/path/to/pkb-search
```

Choose a new output directory. The harness refuses overwriting prior runs.
It makes no network/model calls and changes no normal user configuration.

Local validation passed an earlier full suite of 554 tests with the real native
sidecar, one optional real-QMD skip and 86.81% coverage. After final origin/error
handling refinements, 35 collaboration/skill tests passed; these counts overlap.
Tests additionally cover concurrent proposal-name creation, main moving between
review and publication even while still an ancestor, divergent publication,
invalid/identity-changing proposals, history outside the brain boundary,
wrong-company push URLs, named-company selection preservation and catalog-save
failure. Ruff and whitespace checks passed. The PR's latest CI results remain
the check for its published final head.

## Remaining acceptance gates

The [command guide](brain-collaboration.md) defines the supported workflow and
its authority boundaries. Publication requires an exact reviewed candidate/base
and existing host permission; the CLI neither enforces a company approval map nor
claims that structural inspection establishes truth. Review returns the complete
patch and separate installed/base/candidate IDs. It does not provide a general
candidate-snapshot source query interface; installed source reads still use the
installed pin. Keep those versions separate during evidence inspection.

Fresh Groundray Lite agents still need to ask/inspect/propose through this
interface, with natural requests and complete failure traces. Real Git-host
review and employee permissions, supported platform packages, company-isolation
access controls and human inspection effort also remain untested. No accuracy,
human-effort or universal portability advantage is inferred from this mechanical
success. The [product goal](groundray-product-goal.md) retains those gates.
