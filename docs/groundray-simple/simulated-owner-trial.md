# Reading the two views: a small model simulation

Four fresh simulated owner participants read the Mosaic answer: two received the
concise cited view, two the evidence view. **Both presentations produced supported
recommendations; no decision-quality advantage for the evidence view was observed.**
Two separate reviewers, with presentation labels removed, each judged all 16
decision criteria supported and useful, with no consequential unsupported assertions.
All 32 criterion quotations passed verbatim checks; root retained the original grades.

The [public observations and judgments](../../evals/groundray/results/2026-10-11-groundray-lite-presentation-v1.json)
contain the frozen prompt, reader, source hashes, participant recommendations,
recorded reads, model feedback, integrity checks and limitations. This is a model
simulation, **not a human owner-use study or a run of the Groundray Lite skill**.
Your qualitative first-use feedback is still needed for the human part.

## What happened

| Observation | Concise view | Evidence view |
| --- | ---: | ---: |
| Fresh simulated participants | 2 | 2 |
| Supported criteria per reviewer | 8/8 | 8/8 |
| Decisions with consequential unsupported assertions, per reviewer | 0/2 | 0/2 |
| View words | 301 | 508 |
| View bytes emitted per participant | 2,919 | 4,331 |
| Source files inspected, summed across participants | 6 | 6 |
| Source bytes emitted, summed across participants | 3,600 | 3,854 |
| Recorded shell commands | 14 | 16 |
| Nonzero shell exits | 2 | 4 |
| Median model-session elapsed time | 56.2 s | 51.2 s |

The evidence view is approximately 69% longer in words. Both views already give
the correct recommendations: scoped USD80 retainer production versus listed USD120
ad-hoc, October margin 62.5% after a posted reversal rather than redesign causation,
mockup acceptance separate from launch, and review of the conditional reservation
with Bea while Tint remains independent. This is a near-ceiling answer-reading
exercise, not a test of catching an incorrect answer.

Each participant could inspect at most three distinct source files using a
recorded helper. All four read the owner-rule file and current QA forecast;
three also opened the November 2 finance correction. One concise participant
instead read the current client message, explicitly noting that its corrected
finance conclusion depended on the presentation because it had not opened the
ledger or correction. Supported decisions do not establish that every assertion
was independently inspected.

Participants described both presentations as useful. That is model self-report,
not actual owner feedback. Source reads and emitted bytes are agent instrumentation,
not human inspection time or cognitive effort. Session elapsed starts at the
first observer action and includes commands, failures and model processing;
the small timing difference is not a controlled speed result.

## The concrete defect found and repaired

All four participants tried valid displayed links containing `sources/…`; the
frozen reader instead expected a path within that folder, and also did not strip
heading fragments. All recovered in the same sessions, but this produced six
failed commands, three in the first evidence participant and one in each other
participant. The underlying Markdown links remain valid. These are adapter
failures, not Portable KB CLI failures or evidence that a wiki cannot navigate.

The [development reader](../../evals/groundray/presentation_reader.py) now accepts
the displayed prefix, heading fragments and encoded filenames, records canonical
source paths and keeps the three-source allowance. It emits the whole file;
it does not validate or jump to headings. Five regression checks cover the observed
link failure, canonical rereads, budget enforcement, view reads, outside targets
and missing files. The fixed reader was **not used to rerun or repair the observed
trials**. Original reader hashes, failure counts and recommendations are preserved.

## What this means for the product

This gives no reason to require the longer evidence view for every answer. A
competent concise answer with citations can support the same recommendations.
The evidence view remains an inspection option for a dispute or a calculation,
while its additional reading burden needs an actual person's assessment.

Only one familiar fictional case, two participants per view and an artificial
attention limit were tested. The presentations are hand-authored and differ in
length and explanation; reviewers are models; model identity is inherited and
unknown. No isolated format effect, skill benefit, real owner effort or statistical
winner can be claimed. The reader defect also confounds navigation and timing.
No trial coaching, participant replacement, output repair or rerun occurred.

The [owner exercise](owner-exercise.md) remains available to record an actual
decision and inspection experience. A future diagnostic simulation would need an
unsupported or stale claim in the presented answer, rather than two already
correct answers, to test whether evidence inspection changes a decision. That
experiment has not been run here.
