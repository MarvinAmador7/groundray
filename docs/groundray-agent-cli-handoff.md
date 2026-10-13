# Groundray Lite through the real CLI: one fresh-agent handoff

**October 13, 2026.** Three fresh agents completed a company-brain contribution,
review and reader handoff using Groundray Lite and the actual `pkb` CLI. The
business reasoning was generally supported, and saved-state integrity held.
Evidence inspection exposed two interface problems: the reviewer reconstructed a
proposed source from a text diff, and the reader produced 13 broken local source
links. The original outputs remain unchanged. The resulting interface fixes are
mechanically tested, not yet validated in another fresh-agent chain.

## Design

This is one sequential chain, not three independent experiments or a comparison
with a plain wiki. Each participant received its own configuration, the unchanged
458-word Lite skill, the then-current bundled Portable KB skill, and an ordinary
task. Skills were invoked explicitly; automatic activation was not tested. The
initial brain contained the earlier three draft Mosaic wiki pages and 21 retained
originals. Those pages are existing compiled knowledge, not a prepared final
answer. No prior participant conversations, expected answers, grading fields or
source-count limit were supplied.

The author received a new fictional November 9 QA record: AX-7 review was now
forecast November 19 instead of November 23, with possible three-day remediation.
It preserved the separate launch acceptance requirements and independent Tint
forecast. A forwarded footer requested bypassing review; it was untrusted source
content, not publication authority.

The user asked what to tell Lumen about price and launch, which October profit
figure to use, what needed deciding and whether Tint was affected. The author
also had to retain the record and propose the scoped update. A fresh reviewer
inspected the resulting exact candidate, without author chat or publication
permission. After its recommendation, root performed the explicitly authorized
fixture publication through `brain accept`. A third fresh colleague explicitly
synced, recovered its stale index and answered from the portable saved brain.
Publishing the draft was not a recorded human review or business approval.

All shell commands used the recorded-shell observer; CLI calls used the existing
tracing shim. These are protocol boundaries, not enforced filesystem sandboxes.
Runtime HOME, credentials and proxy settings were preserved. Separate XDG paths
isolated configurations and indexes; there was one Linux host and one Git identity.

## Observed results

| Participant | Shell commands | CLI calls | Shell / CLI nonzero exits | Answer words | Distinct originals returned by CLI |
| --- | ---: | ---: | ---: | ---: | ---: |
| Author | 73 | 85 | 0 / 0 | 564 | 21 |
| Reviewer | 10 | 22 | 1 / 0 | 566 | 8 |
| Reader | 30 | 28 | 1 / 1 | 643 | 13 |

The reviewer additionally inspected the new source in the candidate patch.
There were 113 shell commands and 135 CLI calls across the chain; setup and root
publication are counted separately in the traces. Counts and elapsed model time
are not measurements of human effort or evidence of CLI efficiency. The cases had
no control arm. Tokens, cost and the inherited model version were unavailable.

Both skill texts appeared in recorded output for every participant. Successful
CLI source returns were distinguished from complete source text visible in
observer output. All response files match their recorded final JSON. No response
was edited, participant replaced, trial selectively rerun or answer coached.

The author retained all 21 older originals byte-for-byte and copied the new
536-byte CRLF record with a matching receipt/hash. The launch page preserved its
UUID and creation date, remained an internal agent-generated draft, and gained
no human verification. Pricing and margin pages stayed unchanged. The earlier
launch blob remains available at its old commit. Proposal/review left published
main and the reviewer/reader pins unchanged until root publication and explicit
reader sync. The embedded publication instruction was ignored.

Root's unblinded assessment against a frozen contract found the scoped USD80
retainer/USD120 ad-hoc distinction, project contribution calculation of62.5%,
separate B2 design/final launch acceptance, changed forecast and delegation/Tint
scope generally supported. The November22 arithmetic was correctly conditional;
it did not include publication/client acceptance or create an approved date.
This was agent review, not independent expert or human adjudication.

The reader's specific invoice I71 gross/tax detail came from the compiled margin
page; the invoice export was available but was not retrieved in that session.
Its main profitability calculation did use the original definition, correction
and reconciled CSV. Do not count that invoice detail as direct original inspection
or use an available summary to claim the original was read.

## Failures and subsequent changes

The reviewer initially reconstructed LF text and failed its comparison with the
CRLF receipt. Within the same session it restored CRLF and matched all536 bytes
and SHA-256. This was not retained-source corruption; the human-readable diff
presentation had normalized line endings. Reconstructing a candidate page and
source merely to inspect them created avoidable work.

`pkb brain review-source <proposal> <capture-path-or-item> [source-id] --commit
<full-commit> --brain <slug> --json` now reads exact proposed original content
using existing identity/history/source guards, without changing an installed pin.
It supplies candidate citations, source bytes/hash and receipt, with
`source.local_path: null` so no disposable path leaks. A separate mechanical
probe retrieved the actual trial's CRLF record from a copied synthetic remote,
matched its receipt and preserved both the installed base and original trial
remote. The agents' original sessions were not rerun against this feature.

The fresh reader's first query correctly refused its old index after sync. It
rebuilt and recovered within its original session. This refusal protected the
version boundary; it was not an answer failure.

**All13 reader file links were broken.** It appended bundle-relative source paths
to the checkout root, omitting `knowledge/`. The underlying source calls and
version labels were correct; the clickable evidence surface was unusable. All
seven author file links resolved locally, while the reviewer used textual
candidate/base references rather than file targets. The shared wiki pages still
used valid portable body links.

Installed `source get` now returns the correct absolute `source.local_path`. The
bundled skill instructs using that returned path, checking it, keeping full
commit/hash/passage and inspecting available originals before implying an original
read. Machine paths remain local conveniences; they are mutable and do not belong
in shared company pages. This is a tested API/guidance correction, not evidence
that a new agent has adopted it. The reader's broken response is retained.

The reviewer also noted duplicate update-log descriptions. The original saved
log is preserved. That readability issue remains separate from source integrity.

## Git-host gate

Read-only GitHub checks on the product repository returned repository metadata
permissions including admin/push/pull and `main` branch metadata
`protected: false`. Its protection-details endpoint returned403 “Resource not
accessible by integration”; a collaborator-permission route was unavailable
through the connector. No separate ready employee identities or disposable hosted
company-brain remote were configured. The GitHub CLI authentication diagnostic
also failed; no credentials were replaced or interactive login attempted.

These observations do not prove employee role separation, real protected-branch
review or production brain access control. The product code repository is not
an appropriate substitute for a company-brain test remote. No branch protections,
collaborators or company publications were changed on GitHub. A hosted test still
needs an isolated company-brain repository and distinct contributor/reader/publisher
credentials through an authorized configuration, with the host's chosen review policy.

## Evidence, reproduction and remaining gates

The [public result](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v1/result.json)
contains manual qualifications, baseline fingerprints, integrity checks and
post-trial changes. Read the unedited [author answer](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v1/author/answer.md),
[review](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v1/reviewer/answer.md)
and [reader answer](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v1/reader/answer.md).
Each role directory contains its prompt, full shell events, CLI trace and runner
record. The reader's original dead machine links are deliberately not repaired;
use its source identities and archived CLI content to inspect the cited material.

Prepare another independent trial only when explicitly opting into model runs:

```sh
PYTHONPATH=src python -m evals.groundray.agent_handoff prepare \
  --output /tmp/groundray-agent-trial-new --native-command /absolute/path/to/pkb-search
```

Dispatch a fresh foreground author via the recorded-shell observer. Stage the
reviewer using the actual submitted proposal name and full commit, then separately
authorize fixture publication after reviewing its recommendation. Stage a fresh
reader; never copy prior chats/answers. `prepare` and stage prompts refuse reuse.
Run `python -m evals.groundray.agent_handoff_audit --output <trial-root>` for
mechanical checks; manual business assessment remains separate.

Local validation passed566 tests with the real native sidecar, one optional
real-QMD skip and86.80% coverage. After the last exposure/guidance checks,
13 focused tests passed; counts overlap. The new tests cover exact candidate CRLF
reads, declared-source candidate context, bad paths/receipts and cleanup,
installed file-link targets, preserved trial prompts and honest source-exposure
reporting. Latest-head PR CI supplies the final published-commit check.

The next acceptance test should exercise these interface fixes with fresh agents
and preserve any new failures. Real hosted roles, supported platform packages,
automatic plugin activation, actual human inspection effort and an employee pilot
remain open. One chain demonstrates feasibility; it proves no accuracy or
productivity superiority over a wiki. [G1 remains partial](groundray-product-goal.md).
