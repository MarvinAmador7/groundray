# Groundray employee pilot

Run one real employee handoff against the supplied **fictional Mosaic Studio**
brain, using a dedicated test repository and separate contributor, publisher and
receiver accounts. For this first pilot, MarvinAmador7 is the publisher and
KarolGarcia712 contributes and receives updates. A distinct read-only account is
not supplied and its permission tests remain pending. The pilot measures whether people can inspect an answer and
exchange a reviewed update across computers. The supplied business approvals are
fictional records; a Git publication is not a newly obtained real business approval.

The user now selected a **full contributor pilot without main protection** on
`fullkontrol/groundray-pilot-mosaic`, keeping the repository private. MarvinAmador7
is the publisher by workflow; KarolGarcia712 contributes and receives with write
access, including main. Review and exact-candidate publication remain the agreed
workflow, but publisher-only main access is not enforced. Employee publication
denial and private unrelated-account denial are separate tests: the former is
outside this selected mode, while the latter still needs an actual unrelated
identity. Use the current
[unprotected contributor setup commands](../evals/groundray/results/2026-10-13-groundray-pilot-setup-v1/ORGANIZATION.md).

The publisher's selected-mode setup succeeded at hosted base
`259fea0d4a3006f5450d0705f07bc868b688ae39`, with contributor access request
complete and main unprotected. No invitation ID was returned; employee access
and acceptance need their own observations. Continue with the
[participant installation steps](../evals/groundray/results/2026-10-13-groundray-pilot-setup-v1/PARTICIPANTS.md),
rather than rerunning provisioning. Keep this full hosted base in session records.

This packet is prepared, not a completed pilot. Native Codex activation and the
participants' actual host permissions must be observed on their own machines.
Agents do not stand in for human feedback. Credentials stay on each participant's
computer; never put them in the packet, brain or observations.

## Prepare the packet

Use the installed development plugin, version `0.1.0-dev.2` or later after checking
its actual required CLI capabilities. From the development checkout:

```sh
python -m evals.groundray.pilot prepare --plugin /absolute/installed/plugin \
  --output /absolute/new/pilot-packet
```

The packet includes unchanged source captures, an incoming QA update, prompts,
blank role/session/observation templates and a ZIP. The ZIP excludes `.git` and
contains no employee credentials or runtime binary. Transfer the separately built
plugin package appropriate to each machine, verify its checksum, and install it
with the native Codex marketplace commands in the plugin installation guide.

The packet's local seed commit is preparation evidence only. After extracting
on another machine and initializing/pushing the dedicated repository, record the
**actual hosted base commit** rather than expecting the preparation hash to match.

## Roles and host checks

For the selected unprotected contributor mode, observe employee read/proposal
success, publisher exact-candidate review/publication and independent employee
sync. Do not run an employee main-publication attempt expecting host denial, and
do not call Karol a read-only receiver. The role-denial table below documents the
earlier protected variant, not requirements for the current unprotected pilot.

Fill `roles.json` with the chosen repository, source URL and actual account handles.
Keep publisher and employee identities distinct; do not count the employee
contributor as a separate read-only account. Each person uses their own normal credentials;
changing Git commit author names does not establish a different authenticated user.
The publisher can also review; the reader must not be granted publication rights.

| Actor | Intended host behavior | Required observed attempt |
| --- | --- | --- |
| Contributor | Read company main; submit a new proposal; cannot advance main. | Proposal succeeds. Exact candidate/base acceptance is refused by the host; main stays unchanged. |
| Publisher | Read/review exact proposal; explicitly advance the published ref. | Candidate sources inspect correctly; acceptance advances precisely the reviewed commit. |
| Reader | Read company main; cannot publish or create proposal refs. | Install/sync succeeds. Publication and proposal submission are refused; main stays unchanged. |
| Unrelated identity | No access to this private test company repository. | Read is refused under that actual identity, independently of any client setting. |

Use a dedicated **private, empty** test repository, with an available host policy
that enforces these ref permissions. GitHub policy availability depends on account,
organization and plan; a personal repository's collaborator roles alone may not
supply the intended boundary. Record the actual rules and their availability;
do not assume read/write labels or a protected flag establish enforcement.
Do not alter the product repository's protections or use it as the company brain.
If the selected host cannot supply these roles, report that deployment blocker.
This pilot implements no new authentication or authorization service.

The publisher/operator initializes the extracted `brain/` folder as a Git
repository if `.git` is absent, commits the synthetic files, sets the supplied
empty test repository as origin, and seeds its published main. Record the hosted
base. Do not replace files or history in an existing company repository.
Then participants clone/install that **same source URL**; attachment checks its
fetch and push origins, so an equivalent-looking path with another origin is
not interchangeable.

Run permission attempts only on this disposable synthetic repository. For a
negative acceptance attempt, supply a genuine structurally valid reviewed
candidate/base; failure from invalid input is not a host-denial test. A proposal
attempt needs a real valid local update. Read errors, CLI validation errors and
actual host refusals must be recorded separately. After every attempt inspect
main from a permitted independent account and verify the expected full commit.
If an actor expected to be denied unexpectedly succeeds, stop and report the
permission failure; do not continue or silently undo the evidence.

## Provisioning the proposed private remote

The current explicit `--without-main-protection` resume option verifies the
existing private synthetic seed, skips protection API calls and requests Karol's
write access. It has no paid-protection plan gate and leaves any existing rules
intact. The selected publisher/reviewer workflow remains a convention rather than
a permission boundary. The organization handoff contains the current commands;
the protection failure and create-only commands below are historical context.

The publisher's organization attempt has now reached a private-protection plan
failure after creating/seeding `fullkontrol/groundray-pilot-mosaic`. **Do not run
the create-only apply command again.** For the current blocker and exact-seed
recovery commands, use the
[organization handoff](../evals/groundray/results/2026-10-13-groundray-pilot-setup-v1/ORGANIZATION.md).
Private organization protection requires GitHub Team or Enterprise; the generic
API error refers to Pro. The employee invitation remains blocked behind protection.

That protection is required for the **contributor permission test**, not for
private Git hosting, installed-brain retrieval or explicit sync. GitHub Free can
support a private receiver-only pilot with read access. Giving Karol write access
for proposals on an unprotected shared repository would also permit direct main
updates, so it would not satisfy the planned contributor boundary. A separately
chosen read-only pilot must defer contributions and their accept/deny tests;
do not report those tests complete or silently grant write access.

The user has selected **fullkontrol** as the new repository owner, with
**MarvinAmador7** remaining the publisher. The new planned source is
`https://github.com/fullkontrol/groundray-pilot-mosaic.git`. Use the current
checkout's provisioner; the original packet's embedded tool predates organization
support. From the extracted packet's parent directory:

```sh
GROUNDRAY_SOURCE_DIR=$(git rev-parse --show-toplevel)
git -C "$GROUNDRAY_SOURCE_DIR" pull --ff-only origin agent/groundray-skill
python3 "$GROUNDRAY_SOURCE_DIR/scripts/provision_groundray_pilot.py" \
  --repository fullkontrol/groundray-pilot-mosaic --publisher MarvinAmador7 \
  --employee KarolGarcia712 --packet "$PWD/pilot-packet"
python3 "$GROUNDRAY_SOURCE_DIR/scripts/provision_groundray_pilot.py" \
  --repository fullkontrol/groundray-pilot-mosaic --publisher MarvinAmador7 \
  --employee KarolGarcia712 --packet "$PWD/pilot-packet" \
  --apply --log "$PWD/fullkontrol-provisioning/provisioning.jsonl"
```

The tool verifies the actual organization type and publisher identity, creates
through the organization API, requires publisher repository admin permission,
then seeds the unchanged synthetic brain. Organization main writes are restricted
to MarvinAmador7, with one review, stale-review dismissal, no force pushes/deletions
and repository admin bypass for explicit exact-commit publication. Other repository
admins retain that bypass. The tool checks the policy response before inviting
Karol; actual employee denial and publisher acceptance remain required tests.

This worker's organization creation attempt returned HTTP 403, “You need admin
access to the organization before adding a repository to it.” The proposed
organization repository still returns 404. The organization's private-protection
availability is not established by these reads; the publisher's normal local
credentials and the protection apply/check must establish it. A host error stops
before invitation and now prints the actual operation/message with its log path.

### Earlier personal-repository attempt

Publisher-machine follow-up: the dedicated private repository now exists at
main `6ed712b78218b5c2809ffceb6243a0c39df62acb`, and its 51 selected seed files
match the packet. Private protection was refused with an explicit GitHub plan
restriction, leaving main unprotected and stopping before the invitation step.
See the [current readiness report](groundray-pilot-readiness.md). The commands
below document the original create-only procedure; do not reapply it to the
existing remote. Resolve the host-plan requirement and use a reviewed recovery
that preserves the seed before inviting the employee.

The prepared plan uses `MarvinAmador7/groundray-pilot-mosaic`. From the extracted packet,
review it without network calls or writes:

```sh
python tools/provision_groundray_pilot.py --packet /absolute/pilot-packet
```

The resumed cloud worker can reach GitHub and authenticates as MarvinAmador7,
but `POST /user/repos` is refused with HTTP 403, “Resource not accessible by
integration.” Successful account/repository reads do not establish permission to
create a new repository. No pilot repository or invitation was created. See the
[resumed setup receipt](../evals/groundray/results/2026-10-13-groundray-pilot-setup-v1/result.json).
On the publisher's machine, using normal credentials that can create private
repositories, the reviewed plan can be applied explicitly:

```sh
python tools/provision_groundray_pilot.py --packet /absolute/pilot-packet \
  --apply --log /absolute/new/provisioning.jsonl
```

The included provisioner needs only Python standard library, Git and GitHub CLI.
This uses the publisher's existing `gh`/Git login, confirms the account, refuses
an existing repository, validates unchanged synthetic packet bytes, creates a
private empty repository, seeds main, configures/verifies its review requirement,
and **only then sends KarolGarcia712 a collaborator invitation**. The script
requires owner admin bypass for exact-commit CLI publication; that bypass is an
explicit pilot policy, not a business approval. Karol must accept the invitation
and use their own account on their machine. No credentials should be provided to
this chat or copied into the packet.

A host/protection failure stops before inviting. Private branch protection may
require a GitHub plan upgrade; this tool does not upgrade accounts, make the repo
public, weaken protection or delete a partially created private repo. Follow the
recorded failure and choose a supported host policy explicitly. API policy receipt
is not enforcement proof; Karol's actual refused main-publication attempt is still
required. A valid existing pilot repository needs a separate reviewed path; this
creation script intentionally leaves it untouched.

The packet ZIP is the portable input; the tracked checkout does not include its
extracted `brain/` directory. Verify its recorded SHA-256 before extracting it,
then run the provisioner against the extracted packet. Do not reconstruct the
brain or change its manifest to bypass a fingerprint refusal. The resumed setup
verified all 53 archived brain files against the manifest and validated all three
draft concepts without findings.

The successful [CI run for the pilot-tooling commit](https://github.com/MarvinAmador7/portable-kb/actions/runs/38438717326)
offers `groundray-plugin-linux-x86_64` and `groundray-plugin-darwin-arm64` artifacts.
Download the artifact for the participant's actual platform and verify the
included `SHA256SUMS` before extracting the inner marketplace ZIP. The resumed
cloud artifact download was also refused; these packages were not installed or
used in a new native activation attempt here.

## Native activation and ordinary answer

Invoke the packaged skills as `$groundray:groundray-setup` and
`$groundray:groundray`. Plugin skills are namespaced by the plugin manifest name.
The original archived packet uses bare names; preserve its original bytes and
record a corrected namespaced prompt as a fresh attempt. Newly prepared packets
use the correct prefix. A manual search/read fallback is evidence of a native
model session using files, not automatic skill-catalog invocation.

On each participant machine, run `codex plugin list --marketplace groundray-dev --json`
and the installed helper's `check`. Preserve existing HOME/CODEX_HOME, credentials,
providers, other plugins and brains. Use a dedicated pilot work directory and,
if isolating product state, task-specific XDG config/data/cache directories.
Do not repurpose HOME or invent model credentials.

Install/select the supplied company source through the helper. Record `brain list`,
`brain status mosaic-studio`, installed commit, index state and provider. In a
**new native Codex chat**, use the packet's `prompts/owner.txt` to invoke Groundray.
Keep the original answer and native events/commands if available. Observe actual
skill discovery and packaged helper use. Manually reading a skill in a foreground
subagent is a different test and cannot close this activation gate.

The person should open evidence links behind price, launch and contribution
claims and record which passages they actually inspected. Record whether the
answer gives the company/period, applicable approval, definition and arithmetic,
conditional forecast, a real missing record and a useful next action. Record
what was unclear or took extra work; do not automatically label an answer correct
because it contains citations or confidence metadata.

A bounded native CLI probe is available after preparing an isolated recorded case:

```sh
python -m evals.groundray.pilot probe-native --case /absolute/prepared-case \
  --codex /absolute/codex --timeout 45
```

It needs `bin/shim.json` and `work/native-prompt.txt`, preserves the full prompt and
stdout/stderr, and terminates only its own process group at the deadline. It never
changes authentication or network routes. Its result does **not** automatically
certify activation; inspect the actual native discovery, commands and response.
HTTP 403 in the cloud response endpoint is an environment blocker, not proof that
the plugin failed its company workflow. Do not bypass a blocked endpoint.

## Contribution, review and second employee

1. The contributor explicitly receives `incoming/qa-update.txt` and uses
   `prompts/contributor.txt` in a fresh chat. Capture the original, update only
   actual dependent prose through CLI plans, retain older evidence and submit a
   new proposal. Record its name, full candidate and published base.
2. The publisher replaces the reviewer prompt's placeholders with those exact
   values. Inspect the diff and candidate originals with `brain review` and
   `brain review-source`. Record the recommendation and outstanding company
   decisions without manufacturing human verification in the synthetic brain.
3. Once the publisher explicitly chooses to publish this reviewed **draft
   knowledge**, run `brain accept --commit CANDIDATE --base BASE`. A moved ref or
   denial requires new inspection; do not bypass it with raw Git publication.
4. The reader independently receives the update through explicit sync and index
   recovery, then uses `prompts/reader.txt` in a fresh chat. Open the locally
   returned evidence paths and compare the full installed/cited version.
5. Verify original CRLF bytes, launch identity/creation/history, unchanged unrelated
   scopes and honest draft/agent authorship. Keep the older answer/version explainable.

Company publication and plugin updates are separate. Record plugin/CLI version
and architecture for each machine. Do not remove brain data as plugin cleanup.
Do not treat restoring the same package as testing migration to a different version.

## Record the human result

Each participant fills a copy of `session-template.json`: exact original answer,
actual machine/version, evidence links opened and passages inspected, errors,
active minutes, feedback, and actual Git versions/outcomes. Leave unobserved fields
null. Store records locally until people choose an authorized sharing destination.
Redact secrets/private paths before sharing logs; this synthetic packet is not a
request to publish real company or employee information.

A completed selected pilot needs native activation evidence, actual contributor
proposal and publisher exact-candidate acceptance, independently synced versions
and real human source inspection/feedback. It does not establish employee main
denial or publisher-only permissions. The earlier protected variant additionally
requires its actual host accept/deny tests.
Report each separately. These are feasibility observations from one pilot, not
an accuracy benchmark, authenticity certification, human business approval,
productivity advantage or general employee deployment guarantee.
