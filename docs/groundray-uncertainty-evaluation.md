# Groundray Lite: uncertainty and inspected evidence

**October 13, 2026 (UTC experiment records).** The prior CLI handoff exposed a
wording problem: suggested client messages strengthened “may take three more
days” into an unsupported maximum. This slice refines Lite and observes preserved
uncertainty in a new chain and separate reader case. It also corrects a root
grading mistake: invoice figures were supported by an inspected owner record,
although the separate invoice export was unread. No CLI, storage profile or
bundled Portable KB workflow changed.

## First refinement: one three-role chain

The 531-word Lite candidate at
`c13fbcaab2f9042f9505cbeeb28e9bfd0ccdd74d` adds general guidance to retain modality,
conditions and bounds in answers, client messages and saved notes, and to
distinguish original inspection from compiled-page evidence. It contains no
invoice filename, expected calculation or test-specific answer. Astra reviewed
the draft read-only; a suggested clarity adjustment preceded the freeze.

Three fresh agents completed author → reviewer → explicitly authorized root
fixture publication → reader sync/answer. CLI/engine skill, native binary,
initial three draft pages and 21 originals, question and 536-byte CRLF QA record
match the prior trial. The author prompt is byte-identical. Reviewer/reader tasks
use ordinary staging with actual proposal metadata. Each prompt and the contract
were frozen before its participant ran, without prior chats or a prepared answer.

| Role | Shell commands | CLI calls | Shell / CLI nonzero exits | Answer words | Distinct originals |
| --- | ---: | ---: | ---: | ---: | ---: |
| Author | 65 | 59 | 0 / 0 | 731 | 21 |
| Reviewer | 8 | 19 | 0 / 0 | 497 | 7 |
| Reader | 32 | 28 | 1 / 1 | 624 | 11 |

The author’s client quote says **“possible three-day remediation if issues are
found.”** Its saved page preserves “may take three more days”; November 22 is an
illustrative scenario, not a maximum or promised completion date. The reviewer
checked seven candidate originals directly at
`877c1b07ff90f434ef6fad20e3646db1ed3785a8`, preserving source/context pins and the
installed base. The reader’s client quote omits remediation duration, while its
explanation preserves the conditional duration and illustrative date. Root found
no unsupported upper bound in these outputs. That is an observed result for this
fixture, not general proof of uncertainty handling.

The author retrieved the invoice export before using its numbers. The reader
did not retrieve that export, but its inspected original owner correction says:
**“Invoice I-71 gross 4,500 includes tax 500; recognized fees remain 4,000.”**
That passage supports the figures. Root initially misclassified the claim as
summary-only and incorrectly flagged its inspection statement. Those findings are
withdrawn. The main 62.5% calculation also uses the inspected definition,
correction and ledger. This is supplied fictional owner evidence, not independently
authenticated invoice data.

All ten reader evidence links matched returned paths and original hashes. All 21
earlier source bytes, the new QA bytes/receipt, launch UUID/creation/history and
unrelated pages survived. No human verification was added. Publication remained
separate from company approval and reader sync. The sole reader CLI error was the
expected stale-index refusal; it rebuilt and recovered in the original session.
Author/reviewer used textual citations rather than machine file links.

Read the [first-refinement result](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v3/result.json),
unedited [author](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v3/author/answer.md),
[review](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v3/reviewer/answer.md)
and [reader](../evals/groundray/results/2026-10-13-groundray-agent-cli-handoff-v3/reader/answer.md).
The folder retains prompts, responses, events, losslessly serialized CLI records,
fingerprints, contract, transport, saved draft, exact input bytes and Astra review.

## Separate final-check refinement

The initial, subsequently withdrawn finding motivated a final claim-by-claim check: a source
listed by a page is not an inspected source; details supported only by an inspected
summary need point-of-claim attribution and an uninspected-original limit, or can
be omitted. Inspection statements must describe actual reads. Astra reviewed the
580-word draft; both optional clarity points preceded the final 585-word freeze at
`30f066cd2401643a02210e2610823a7ac60ca400`.

A separate fresh reader received the byte-identical task and exact same published
brain content/commits through a new copied synthetic remote. Its initial
installation/index used the same old base; root separately published the same
candidate through `brain accept`, and the reader synced. The original trial
remote and responses remain unchanged. This is an adaptive follow-up after an
initial grading finding, not a replacement participant or an independent control arm.

The fresh reader made ten shell calls and 26 CLI calls, with one expected stale-index
refusal/recovery, and returned a 716-word answer. It preserves “may take three more
days” in the client quote and treats November 22 as an illustrative scenario.
Its invoice figures are also directly supported by the inspected owner correction;
the invoice CSV remains unread. All 14 local targets exist: eleven match returned
original paths/hashes, and three point to retrieved compiled wiki pages. The
installed knowledge matches the exact published brain; protected inputs, skill,
prompt and unedited response remain intact. The 585-word candidate was tested
read-only, without another authoring chain.

Read the [separate reader result](../evals/groundray/results/2026-10-13-groundray-lite-inspection-check-v1/result.json)
and [unedited answer](../evals/groundray/results/2026-10-13-groundray-lite-inspection-check-v1/reader/answer.md).

## Grading correction and future review method

Readers in the original trial, the inspection-interface follow-up and both cases
here actually retrieved the owner correction, with its full body in recorded output.
Requiring one particular invoice filename incorrectly ignored this alternate
supporting original. The invoice-export read remains unobserved; the claimed
figures do have original-record support. Earlier unsupported-maximum wording and
broken file links remain valid findings.

The first three result folders retain `grading-before-correction.json` alongside
corrected assessments and `grading-correction.json`, recording the actual source
path, hash, commit and quote. No participant answer, prompt, event, CLI trace,
frozen contract or mechanical audit was repaired.

Before grading a claim unsupported, enumerate its exact assertion, inspect all
actually returned supporting passages, and record the source quote/scope/version.
Distinguish an unread specific export from absence of any inspected supporting
record. Attribute supplied reports honestly; support does not certify authenticity.
This is a manual review rule, not an automated semantic truth score.

## Limits and remaining acceptance work

Assessment combines recorded mechanical checks with unblinded root reading of
the untouched answers against frozen contracts. Astra reviews are textual checks,
separate from model-trial results. No human adjudication, comparative effort,
randomized control or accuracy/efficiency superiority is measured. Shell grouping
differs between participants; command counts are observations, not human work.
Complete bodies in observer output do not prove comprehension or authenticity.

The fixture runs on one Linux host/Git identity with isolated XDG state and
explicit skill invocation. Protocol boundaries are not an enforced filesystem
sandbox or host permission test. Local evidence paths are mutable conveniences
checked at audit time, not portable archive links on other machines.

Future acceptance work should cover other companies, explicitly bounded estimates
and firm scoped commitments, missing originals with honest summary fallback, and
changes that expose misleading compiled notes. Hosted employee permissions,
packaging/platforms, automatic activation and a human pilot remain open. Full G1
completion and release are not claimed.
