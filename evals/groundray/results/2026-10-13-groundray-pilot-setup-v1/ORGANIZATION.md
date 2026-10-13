# Fullkontrol private pilot setup

Repository owner: **fullkontrol**. Publisher: **MarvinAmador7**.
Employee contributor/receiver: **KarolGarcia712**.
Planned source: `https://github.com/fullkontrol/groundray-pilot-mosaic.git`.

## Current selection: private contributor pilot without main protection

The user explicitly selected full contribution without main protection. Keep the
repository private and grant Karol contributor write access, including main.
Publisher review and publication remain workflow conventions; employee main
denial and publisher-only host enforcement are outside this pilot. No eligible
paid protection plan is required for this mode, and existing rules are preserved.

From the same terminal directory used for packet extraction and the failed
organization apply, fetch the updated tool and reuse the original hosted seed:

```sh
GROUNDRAY_SOURCE_DIR=$(git rev-parse --show-toplevel)
git -C "$GROUNDRAY_SOURCE_DIR" pull --ff-only origin agent/groundray-skill
GROUNDRAY_ORG_SEED=$(git -C "$PWD/fullkontrol-provisioning/pilot-seed-clone" rev-parse HEAD)
python3 "$GROUNDRAY_SOURCE_DIR/scripts/provision_groundray_pilot.py" \
  --repository fullkontrol/groundray-pilot-mosaic --publisher MarvinAmador7 \
  --employee KarolGarcia712 --packet "$PWD/pilot-packet" \
  --resume-base "$GROUNDRAY_ORG_SEED" --without-main-protection
python3 "$GROUNDRAY_SOURCE_DIR/scripts/provision_groundray_pilot.py" \
  --repository fullkontrol/groundray-pilot-mosaic --publisher MarvinAmador7 \
  --employee KarolGarcia712 --packet "$PWD/pilot-packet" \
  --resume-base "$GROUNDRAY_ORG_SEED" --without-main-protection \
  --apply --log "$PWD/fullkontrol-contributor-resume/provisioning.jsonl"
```

The default command prints a reviewable plan. Apply verifies publisher identity,
admin permission, repository privacy/owner, unchanged main and packet-matching
selected seed files before requesting write access. Resume never recreates the
repository or pushes main. This explicit mode skips protection setup/read/delete
calls and paid-plan checks. Existing protection stays intact. A changed seed or
moved main still stops before the access request.

Retain the returned `base_commit`, `source_url`, `hosted_main_protected` and
`main_protection_required` fields. If an invitation ID is returned, Karol must
accept it with Karol's own account. An empty-success access update for an existing
collaborator returns no invitation ID; it is not a failed invitation. Acceptance,
actual employee permissions and native/human session results still need observation.
Update the local role/session records with the actual source and selected mode;
do not mark publisher-only enforcement or employee publication-denial as tested.

Use this source consistently for installation and authoring attachment. Continue
the actual proposal, exact-candidate/source review, explicit publisher acceptance,
independent sync and human evidence inspection in the
[employee runbook](https://github.com/MarvinAmador7/portable-kb/blob/agent/groundray-skill/docs/groundray-pilot.md).
Fifty-two focused tests and Ruff pass; no real invitation or participant result
is claimed in the [selected-mode receipt](unprotected-contributor-plan.json).

## Earlier protected-mode blocker and recovery

The publisher's local organization apply reached protection after creating and
seeding the private repository, then returned HTTP 403: “Upgrade to GitHub Pro
or make this repository public to enable this feature.” No provisioner invitation
followed. The worker cannot independently inspect that private repository with
its integration credential; its 404 is not proof the repository is absent.

Private organization protection and the named-publisher writer restriction need
[GitHub Team or Enterprise](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).
Keep the repository private. Account billing needs a user decision; no billing
change is performed by this tool. Do not repeat create-only apply or change the
packet's fingerprints. The earlier organization handoff archive documents the
original creation attempt and predates resume support.

The eligible plan is required for the contributor boundary, not for hosting the
private brain. A receiver-only private pilot can use GitHub Free with read access
and test native answering, evidence inspection and sync. Employee proposal writes
to this same shared repository require write access, which also permits main
updates without host protection. A read-only pilot must therefore defer employee
contributions and the protected-main accept/deny tests. That scope choice is
separate from choosing a private repository destination.

After an eligible plan is available, use the current checkout from the same
terminal directory. The local seed clone identifies the full commit that was
pushed by the failed attempt; this command does not create a new commit:

```sh
GROUNDRAY_SOURCE_DIR=$(git rev-parse --show-toplevel)
git -C "$GROUNDRAY_SOURCE_DIR" pull --ff-only origin agent/groundray-skill
GROUNDRAY_ORG_SEED=$(git -C "$PWD/fullkontrol-provisioning/pilot-seed-clone" rev-parse HEAD)
python3 "$GROUNDRAY_SOURCE_DIR/scripts/provision_groundray_pilot.py" \
  --repository fullkontrol/groundray-pilot-mosaic --publisher MarvinAmador7 \
  --employee KarolGarcia712 --packet "$PWD/pilot-packet" \
  --resume-base "$GROUNDRAY_ORG_SEED"
python3 "$GROUNDRAY_SOURCE_DIR/scripts/provision_groundray_pilot.py" \
  --repository fullkontrol/groundray-pilot-mosaic --publisher MarvinAmador7 \
  --employee KarolGarcia712 --packet "$PWD/pilot-packet" \
  --resume-base "$GROUNDRAY_ORG_SEED" \
  --apply --log "$PWD/fullkontrol-protection-resume/provisioning.jsonl"
```

The default remains a plan. Explicit resume apply requires publisher identity and
admin permission, private repository and correct owner, the unchanged full main
commit, and exact packet-matching selected seed files with no symlinks or extras.
It uses a new local read-only clone, never recreates/reseeds/pushes main, and
checks the pinned main before protection and invitation. An already protected
policy is inspected rather than replaced. A changed base or content, incompatible
policy, unavailable protection or inactive protection stops before invitation.
Use a new log directory for a subsequent attempt and preserve the failed logs.

The [follow-up receipt](organization-protection-blocker.json) distinguishes the
publisher-reported host result from worker access errors. Twenty-nine focused
tests pass, including stale base, changed/extra/symlinked seed files, concurrent
main changes and existing-policy refusal. No actual host recovery or employee
enforcement outcome is claimed.

## Earlier creation procedure

The cloud's actual organization-creation request was denied with HTTP 403,
“You need admin access to the organization before adding a repository to it.”
The new organization repository still returns 404. Use the publisher's existing
local login with organization repository-creation/admin rights. The tool checks
the actual private branch-protection response; organization existence alone does
not prove plan eligibility. The earlier personal seed remains private and intact.

From the same terminal directory used for the original packet extraction:

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

Use the current checkout script, rather than `pilot-packet/tools/`, whose embedded
version supports only the original personal-owner assumption. If using the
`groundray-pilot-fullkontrol-handoff.zip` instead, extract its original packet
as described in `SETUP.md`, then use its `current-tools/provision_groundray_pilot.py`
with the same arguments and a fresh log directory.

The plan uses the organization creation endpoint, verifies publisher identity,
organization type, new/private repository, returned owner/name and publisher admin
permission, and seeds only unchanged fictional `brain.yaml` and `knowledge/`.
Main requires one review with stale-review dismissal, blocks force pushes/deletion,
and restricts ordinary writers to MarvinAmador7. Repository admins retain bypass
for explicit exact-commit publication. Policy verification precedes Karol's invitation.
This is a dedicated pilot repository policy; other organization settings are untouched.

Retain the returned hosted base and source URL. Use this source URL consistently
for company installation and authoring-clone attachment. Record the actual
organization destination and source URL in `roles.json`; do not substitute the
earlier personal hosted commit. Karol must accept the invitation with Karol's
own account. Native activation, actual valid-candidate host denial/publication,
independent sync and human source inspection remain pending.

The [organization receipt](organization-setup.json) records the worker's observed
denial and reviewed policy without storing credentials or the publisher's private
machine paths. Fourteen focused tests, lint, corpus and seed-byte checks pass;
fake-host policy tests are not actual enforcement proof.
