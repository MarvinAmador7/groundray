# Fullkontrol private pilot setup

Repository owner: **fullkontrol**. Publisher: **MarvinAmador7**.
Employee contributor/receiver: **KarolGarcia712**.
Planned source: `https://github.com/fullkontrol/groundray-pilot-mosaic.git`.

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
