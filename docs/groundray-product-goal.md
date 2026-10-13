# Groundray product goal

**Goal: employees and agents can use the same portable company brain on separate
computers, inspect the evidence behind an answer, and exchange reviewed updates
without losing company scope, original records or decision history.**

Groundray is the intended product: plugin, skill, CLI and shared infrastructure.
Portable KB supplies the existing engine foundation. This goal is adopted;
integration and rollout remain planned. The released interface is currently `pkb`,
and the Groundray skills are prototypes. No Groundray plugin, renamed executable
or hosted service is claimed to be released by this document.

## Product contract

The owner-facing experience is **answer → evidence → guidance**:

- **Answer:** a direct, scoped conclusion the employee can use now.
- **Evidence:** the inspected records, applicable definitions, calculations and
  limitations behind consequential claims.
- **Guidance:** the next useful check or action, who needs to decide, and what
  remains unresolved. A recommendation remains distinct from approval or execution.

This contract reflects owner feedback on the inspection experience. Existing
synthetic evaluations establish no clear accuracy advantage over the wiki approach,
and comparative human effort remains unmeasured. Product acceptance will include
reliable sharing and actual employee use, alongside answer quality.

| Part | Responsibility | Current foundation / remaining work |
| --- | --- | --- |
| Plugin | Make the selected company, skill and CLI available to the agent. | Codex/Claude skill installation exists for Portable KB. Groundray plugin packaging and installation lifecycle need implementation. |
| Skill | Produce answers, evidence and guidance; preserve scoped claims and reasoning during authorized edits. | Full Groundray and Lite exist. Three local fresh-agent chains and a separate reader case exercise the CLI; uncertainty refinement is scoped, with generalization and human inspection unmeasured. |
| CLI | Create/install/select brains, retrieve evidence, inspect state, publish and sync. | Existing `pkb` operations provide a base. A coherent Groundray entry point and compatibility/upgrade behavior need design and implementation. |
| Infrastructure | Store published company versions, enforce access and support reviewed collaboration. | Git repositories and host permissions provide the first shared layer. Employee contribution/review/distribution flows need end-to-end validation. |

## First MVP

An employee installs Groundray, selects an authorized company brain, explicitly
syncs its published version, asks a question and can inspect its sources. When
asked to improve the brain, the employee proposes a scoped change for company
review. An authorized publisher makes the reviewed version available; another
employee explicitly syncs it and recovers the updated reasoning and history.

Use Git-backed company repositories and existing host credentials/permissions
for the first infrastructure. Each company has a separate brain identity and
repository; local catalogs, settings and disposable indexes belong to the employee.
The shared files contain knowledge and authorized source captures, with portable
links. Personal credentials and local caches do not belong in the brain repository.

Show the selected company, installed commit, local changes and index version.
Remote freshness must be based on an explicit check: show the last known remote
state and when it was checked, or say that freshness is unknown while offline.
Answers retain their source version so an older answer remains explainable after sync.

Publication follows the company's chosen protected branch/ref and review process.
Git read/write permission governs repository access; it does not establish who
can approve pricing, customer promises or other business decisions. Those rules
come from the company. Publishing a brain cannot manufacture human verification
or turn a conversation report into an approved business fact.

The initial target is the existing macOS/Linux distribution surface, with Codex
as the first plugin target and Claude Code as the next compatibility target.
Validate the supported OS/architecture combinations before claiming deployment
coverage. Windows support is a separate delivery gate if employee requirements
include it. No universal platform support is assumed.

## Delivery milestones

| Milestone | Deliverable and exit condition | Status |
| --- | --- | --- |
| G0 — Storage and interface fit | Specify how company wiki prose, source bytes, definitions and authority records use the current validated bundle and retrieval/mutation interfaces. Demonstrate one usable company brain with portable evidence links. Resolve any needed adapter explicitly. | CLI source/proposal and fresh Lite chains exercised; candidate inspection and reader paths observed in one follow-up |
| G1 — Two-employee workflow | Run the acceptance scenario below using isolated employee installations and a shared test remote. Record versions, saved-state integrity, proposal/review flow and refusal states. | Three local fresh-agent chains and a separate reader; uncertainty refinement observed, with host/platform/human and generalization gates open |
| G2 — Groundray packaging | Package the skill and CLI for the agent plugin; document install/select/sync/ask/propose/update/uninstall, compatible engine versions and upgrades preserving existing brains. Run G1 through the actual package. | Planned |
| G3 — Employee pilot | Validate packaged behavior on supported platforms and have people inspect answers and contribute a reviewed change. Record decisions, source inspections, effort and failures separately. | Planned |

G0 is important because current CLI installation validates an OKF-compatible
bundle, while the Groundray prototypes can use ordinary wiki conventions. A raw
Markdown folder is not automatically an installable `pkb` brain. Preserve original
source bytes and meaningful body prose; generate required engine metadata through
supported tools. Do not silently rewrite originals, discard unknown fields or
promise whole-wiki import. Any adapter, new source-read surface or profile change
needs its own explicit implementation scope and validation.

The [first G0 demonstration](groundray-engine-fit.md) distributes three linked
drafts and 21 unchanged source captures, retrieves their evidence through a
development reader, and exercises local installation/search/update/sync. It does
not execute Lite in a fresh agent or complete G1. Source capture/read interfaces,
original Markdown handling and remote-installed authoring were integration gaps.

The [CLI-only follow-up](groundray-cli-sources.md) now captures and reads originals
through supported draft-branch commands, preserving bytes and receipts without a
profile change. The chosen opaque `.md.txt` convention separates raw Markdown from
concept discovery. The [employee handoff follow-up](groundray-employee-handoff.md) now exercises
remote-installed authoring attachment, commit-pinned proposals/review/publication
and explicit reader sync through a local bare Git remote. The [fresh-agent follow-up](groundray-agent-cli-handoff.md) now exercises Lite
through CLI contribution/review/sync chains. The first exposed candidate-source
inspection overhead and broken reader file links. The follow-up used exact candidate
retrieval and ten working original-source targets, while retaining unsupported
“up to three days” client wording. The [semantic follow-up](groundray-uncertainty-evaluation.md)
refines Lite and observes conditional wording in new agents. An invoice attribution
finding was withdrawn: the readers inspected an owner record containing the figures;
the initial grading remains preserved. This is scoped validation, not accuracy superiority.
Real host permissions
and separate-computer packaging remain to be tested;
no release or full G1 completion is claimed.

G1 can first use two isolated employee homes on one Linux host to prove the
workflow. That is a development test, not proof of distinct computers or OS
compatibility. G2/G3 must validate real supported platform installations.

## Two-employee acceptance scenario

Use an isolated fictional company brain and an explicitly identified shared
published ref. Employee A can propose changes; an authorized publisher controls
that ref. Employee B installs it independently. The initial scenario must show:

1. A and B recover the same published commit, company definitions, source bytes
   and evidence links without manually copying files or repairing machine paths.
2. Fresh agents on both installations answer an ordinary company question with
   the same applicable records and equivalent scoped conclusions. Exact wording
   need not match. Company selection and the cited version are inspectable.
3. A proposes a material update using the supported change workflow. Its origin,
   actor, new evidence and prior reasoning remain recoverable. Agent-generated
   content is not relabeled human-authored or automatically verified.
4. The company reviews the proposal and an authorized publisher advances the
   published ref. Structural review and business approval remain distinguishable.
   Simulated approval in a test must be labeled as simulated.
5. B explicitly syncs, receives the validated version and can inspect what changed.
   Retrieval uses the matching index or clearly requires rebuilding it; an old
   index cannot quietly represent itself as current.
6. An older cited answer remains traceable to its version. Changed evidence flags
   actual dependent work for review, retaining earlier decisions and unrelated scopes.
7. Dirty/divergent local state, a moved remote ref and denied access do not erase
   local work or silently merge business claims. Invalid updates leave the previous
   usable installation intact and report an actionable reason.
8. A second company's identically named customer/metric remains separate.
   Comparison is explicit; permissions are enforced by the storage host, never
   granted by a Markdown label or imported instruction.

Record install/sync outcomes, source and version integrity, relevant failures,
actual agent commands and employee feedback. Do not infer human effort from model
elapsed time or count file-format compliance as a successful business decision.
The first run demonstrates the workflow; it does not establish general reliability.

## Scope and follow-on decisions

This goal uses existing file, Git and local-search foundations. It introduces no
required schema fields and does not change released commands or existing brains.
Implementation must keep current engine compatibility and explicit mutation behavior.

Hosted services, custom authentication/authorization, multitenant APIs, MCP servers,
external connectors, native/web UI and automatic background synchronization remain
later decisions. Recording this product goal is not production deployment or
authorization to publish company records. Expanding those surfaces requires a
concrete scope and review of the applicable permission boundaries.

See [the engine roadmap](roadmap.md), [Groundray prototypes and evidence](groundray.md),
[the CLI reference](cli.md) and [current distribution](releases.md).
