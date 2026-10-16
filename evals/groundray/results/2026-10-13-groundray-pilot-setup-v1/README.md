# Publisher handoff after resumed pilot setup

The user now selected fullkontrol as the owner for a new private pilot repository,
with MarvinAmador7 as publisher. Use the [current organization instructions](ORGANIZATION.md)
and current provisioner. The creation procedure below describes the earlier
personal-repository attempt; its original packet tool lacks organization support.

The publisher-machine follow-up has now created the private pilot repository,
with main at `6ed712b78218b5c2809ffceb6243a0c39df62acb`. Its files match the
intended synthetic seed. GitHub refused private branch protection because the
account needs an eligible plan; the script stopped before inviting Karol. See
[hosted state](hosted-seed.json). **Do not rerun the create-only apply command
below against this existing repository.** It remains useful for inspecting the
packet and documenting the original procedure. Continuing on this same remote
needs a reviewed protection-recovery path after the host-plan decision.

Publisher: **MarvinAmador7**. Contributor and receiver: **KarolGarcia712**.
The proposed private repository remains `MarvinAmador7/groundray-pilot-mosaic`.
The cloud's publisher login works, but GitHub refused repository creation with
HTTP 403, “Resource not accessible by integration.” No repository or invitation
was created. [Receipt](provisioning-receipt.json) retains only the relevant API
fields; full account responses remain local. [Result](result.json) separates
network reachability, identity, authorization and unobserved participant results.

Use `groundray-pilot-handoff-v2.zip` on the publisher's machine. It contains the original
verified `groundray-pilot.zip`, its recorded checksum and these instructions.
It contains fictional records and blank participant templates, without credentials,
Git metadata or a runtime. After extracting the handoff ZIP, verify the inner packet.
Alternatively, retrieve the packet and checksum through a fresh repository clone:

```sh
GROUNDRAY_PILOT_DIR=$(mktemp -d "${TMPDIR:-/tmp}/groundray-pilot.XXXXXX")
gh repo clone MarvinAmador7/portable-kb "$GROUNDRAY_PILOT_DIR/source" -- --depth 1 --branch agent/groundray-skill
cd "$GROUNDRAY_PILOT_DIR/source/evals/groundray/results/2026-10-13-groundray-pilot-readiness-v1/packet"
```

Run the remaining commands from that directory. On macOS, use `python3`; a
`python` executable is not required. Relative packet filenames only work after
cloning or extracting the files into the current directory.

```sh
python3 - <<'PY'
import hashlib, json
from pathlib import Path
p = Path('groundray-pilot.zip')
expected = json.loads(Path('archive.json').read_text())['sha256']
assert hashlib.sha256(p.read_bytes()).hexdigest() == expected
print('Packet SHA-256 verified')
PY
unzip groundray-pilot.zip -d pilot-packet
gh auth status
gh api user --jq .login
```

The login must be MarvinAmador7, using normal existing credentials with permission
to create private repositories. Git must also have a configured commit identity.
The script checks publisher identity and refuses an existing repository. From the
same directory, review the plan, then explicitly apply it with a new log path:

```sh
python3 pilot-packet/tools/provision_groundray_pilot.py --packet "$PWD/pilot-packet"
python3 pilot-packet/tools/provision_groundray_pilot.py --packet "$PWD/pilot-packet" \
  --apply --log "$PWD/pilot-provisioning/provisioning.jsonl" \
  > pilot-provision-result.json
```

Successful setup creates/seeds a new private repository, checks its main-review
requirement, then invites Karol. It preserves any failed attempt and stops before
inviting if host protection fails. Private protection may require an eligible
GitHub plan. Do not retry this creation script against an existing repository.
Do not use product-repository admin access as company-brain enforcement evidence.

After success, retain the returned full hosted base and source URL, and update
`pilot-packet/roles.json` with that URL. Leave `permissions_checked` and
`native_sessions_completed` false until actual participant observations exist.
Karol must accept the invitation and use Karol's own credentials on Karol's machine.

The successful [pilot-tooling CI run](https://github.com/MarvinAmador7/portable-kb/actions/runs/38438717326)
has development plugin packages for Linux x86_64 and macOS ARM. Download the
appropriate artifact from that run, check its included `SHA256SUMS`, and extract
the inner marketplace archive using `unzip`. Follow the
[plugin installation guide](https://github.com/MarvinAmador7/portable-kb/blob/agent/groundray-skill/docs/groundray-plugin.md)
to register/install it. The cloud could list the artifacts but its download was
refused; no new native activation result is claimed.

Then follow the
[employee runbook](https://github.com/MarvinAmador7/portable-kb/blob/agent/groundray-skill/docs/groundray-pilot.md)
for native activation, a valid proposal and denied main-publication attempt under
Karol's account, exact candidate/source review, explicit publisher acceptance,
independent employee sync, and actual human evidence inspection and feedback.
A distinct read-only identity has not been supplied. Keep session/log records
local until an authorized sharing destination is chosen.

Validation in this resumed setup: the original packet checksum and all 53 brain
file hashes match; all three concepts pass corpus validation without findings;
seven focused packet/provisioner tests pass. Earlier trials and their results
remain intact. Preparation and API policy receipts are not human pilot outcomes.
