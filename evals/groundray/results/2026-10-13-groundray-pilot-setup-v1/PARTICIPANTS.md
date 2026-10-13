# Publisher and employee installation

Company source: `https://github.com/fullkontrol/groundray-pilot-mosaic.git`.
Initial hosted base: `259fea0d4a3006f5450d0705f07bc868b688ae39`.
Publisher: MarvinAmador7. Contributor/receiver: KarolGarcia712.
The publisher reported successful private seed recovery and collaborator access
request. Main is unprotected; publisher and review roles are workflow conventions.
No participant native session or effective employee permission is yet recorded.
The publisher supplied `Darwin arm64`; use the Apple Silicon macOS package for
the publisher. Karol's actual machine/architecture remains unsupplied.

## Check each person's own login and access

The publisher can inspect Karol's effective role with normal local credentials:

```sh
gh api repos/fullkontrol/groundray-pilot-mosaic/collaborators/KarolGarcia712/permission \
  --jq '{login:.user.login,permission,role_name}'
```

Karol runs these on Karol's machine, using Karol's own existing login:

```sh
gh api user --jq .login
gh api repos/fullkontrol/groundray-pilot-mosaic \
  --jq '{full_name,private,permissions}'
git ls-remote https://github.com/fullkontrol/groundray-pilot-mosaic.git refs/heads/main
uname -sm
codex --version
```

The login should be KarolGarcia712, the repository private, and push permission
available for the contributor. Record the actual result rather than changing
credentials or treating the publisher's login as the employee. If an invitation
is pending, Karol accepts it normally first. The successful access result had
no invitation ID; it does not prove Karol's authenticated access. Do not test
employee publication expecting denial in this selected mode.

## Download the matching development package

This successful [CI run](https://github.com/MarvinAmador7/portable-kb/actions/runs/38446836188)
at `bff1fdda5eccb98372946d46621806b7df6060a3` provides non-expired plugin
`0.1.0-dev.2` artifacts. The CLI/skills are unchanged by the later provisioning-only
changes. The packet contains no runtime; install this native package separately.

| Machine | Artifact | Inner marketplace archive |
| --- | --- | --- |
| macOS Apple Silicon (`Darwin arm64`) | `groundray-plugin-darwin-arm64` | `groundray-0.1.0-dev.2-darwin-arm64.zip` |
| Linux x86_64 (`Linux x86_64`) | `groundray-plugin-linux-x86_64` | `groundray-0.1.0-dev.2-linux-x86_64.zip` |

There is no supplied native Windows or macOS Intel artifact in this run. Select
a compatible environment or follow the source build guide for a supported target;
do not relabel a binary for another platform. Record each actual machine/architecture.

For Apple Silicon macOS, create a persistent directory under the user's home:

```sh
GROUNDRAY_INSTALL_DIR=$(mktemp -d "$HOME/groundray-pilot-install.XXXXXX")
gh run download 38446836188 --repo MarvinAmador7/portable-kb \
  --name groundray-plugin-darwin-arm64 --dir "$GROUNDRAY_INSTALL_DIR/artifact"
find "$GROUNDRAY_INSTALL_DIR/artifact" -name SHA256SUMS -print
```

The artifact preserves the `groundray-marketplace/` and smoke-results directories.
Enter the directory containing the marketplace `SHA256SUMS` and verify its inner
archive before extraction. If the artifact download tool flattens that root, use
the actual path printed above:

```sh
cd "$GROUNDRAY_INSTALL_DIR/artifact/groundray-marketplace"
shasum -a 256 -c SHA256SUMS
unzip -q groundray-0.1.0-dev.2-darwin-arm64.zip -d "$GROUNDRAY_INSTALL_DIR/marketplace"
codex plugin list --json
codex plugin marketplace add "$GROUNDRAY_INSTALL_DIR/marketplace" --json
codex plugin add groundray@groundray-dev --json
codex plugin list --marketplace groundray-dev --json
"$GROUNDRAY_INSTALL_DIR/marketplace/plugins/groundray/scripts/groundray" check
```

If Groundray is already installed, preserve it and its company state; inspect
the [update instructions](https://github.com/MarvinAmador7/portable-kb/blob/agent/groundray-skill/docs/groundray-plugin.md)
before replacing its marketplace registration. Preserve HOME/CODEX_HOME, normal
credentials, other plugins and existing provider/brain settings. Package install
does not synchronize or publish company knowledge. Keep the printed permanent
directory path so it can be found after restarting Terminal.

## Install the company and start a fresh native chat

Run a new Codex chat with this request, using the actual installed Groundray plugin:

> Use $groundray-setup. Install and select the fictional Mosaic Studio brain from
> https://github.com/fullkontrol/groundray-pilot-mosaic.git. Preserve my existing
> providers, credentials and brains. If unconfigured, use built-in keyword search.
> Verify the Groundray helper, report the full installed commit, and index only
> mosaic-studio if needed. Expected initial hosted base is
> 259fea0d4a3006f5450d0705f07bc868b688ae39. Do not publish company changes.

Then use the original packet's owner prompt in another fresh native chat. Record
actual skill/helper discovery, original answer, installed pin, evidence links
opened and passages the person inspected. A configured plugin is not activation
proof. Keep the original answer and command errors; do not repair trial responses.

Karol next receives the packet's original QA update and contributor prompt. Submit
a named proposal, retain full candidate/base, and ask Marvin to review the exact
candidate and its originals. Marvin explicitly chooses whether to accept the
reviewed draft through `brain accept --commit --base`. Karol independently syncs
and rebuilds only the disposable index when needed. Follow the
[employee runbook](https://github.com/MarvinAmador7/portable-kb/blob/agent/groundray-skill/docs/groundray-pilot.md)
for original-byte preservation and blank session records. The supplied business
records remain fictional and unverified by real humans.
