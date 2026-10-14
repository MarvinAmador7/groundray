# Publisher and employee installation

Company source: `https://github.com/fullkontrol/groundray-pilot-mosaic.git`.
Initial hosted base: `259fea0d4a3006f5450d0705f07bc868b688ae39`.
Publisher: MarvinAmador7. Contributor/receiver: KarolGarcia712.
The publisher reported successful private seed recovery and collaborator access
request. Main is unprotected; publisher and review roles are workflow conventions.
No participant native session or effective employee permission is yet recorded.
The publisher supplied `Darwin arm64` and confirmed Karol also uses Apple
Silicon. Both participants use the Apple Silicon macOS package.

The publisher has now installed/enabled `groundray@groundray-dev` version
`0.1.0-dev.2` with native Codex CLI `0.151.0`, after the ARM archive checksum passed.
See the [publisher installation receipt](publisher-plugin-install.json). The
publisher subsequently supplied “Groundray CLI compatible: pkb 0.2.0,” confirming
the helper's version and command probes. Company configuration and model-backed
activation remain unobserved. Continue in a fresh native terminal Codex session
with the setup prompt below; the skill inspects `doctor --json` and the catalog
before setup. Missing configuration is a first-time setup state. Preserve a
valid existing configuration and selected provider. Karol still needs to install
the matching package under Karol's own account.

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

The publisher's first native setup session now reports successful installation,
selection and current indexing at the expected hosted pin, preserving QMD. It
used a manual fallback after the earlier bare skill name was not found. See the
[original trace receipt](publisher-native-setup-trace.json). A later fresh
verification session reports successful `$groundray:groundray-setup` discovery,
a healthy/active/clean valid brain and a current QMD 2.5.3 index at the hosted pin.
Its commands are collapsed, so raw status output remains unobserved by the worker.
See the [new verification receipt](publisher-native-verification-v2.json).
Do not reinstall or reset
the publisher's existing configuration to retry discovery. Karol's setup remains
a separate own-account run.

Run a new Codex chat with this request, using the actual installed Groundray plugin:

> Use $groundray:groundray-setup. Install and select the fictional Mosaic Studio brain from
> https://github.com/fullkontrol/groundray-pilot-mosaic.git. Preserve my existing
> providers, credentials and brains. If unconfigured, use built-in keyword search.
> Verify the Groundray helper, report the full installed commit, and index only
> mosaic-studio if needed. Expected initial hosted base is
> 259fea0d4a3006f5450d0705f07bc868b688ae39. Do not publish company changes.

Then use the original packet's owner prompt in another fresh native chat. Record
actual skill/helper discovery, original answer, installed pin, evidence links
opened and passages the person inspected. A configured plugin is not activation
proof. Keep the original answer and command errors; do not repair trial responses.

The original preserved packet predates this namespace correction: when invoking
its business prompts, use `$groundray:groundray` in the fresh session instead of
the original bare `$groundray`. Keep original packet/trial bytes intact and record
the corrected invocation as a new attempt. Future prepared packets use the
namespaced form. Setup uses `$groundray:groundray-setup`. The publisher's first
setup session used a manual fallback after bare-name lookup failed, so it does
not establish automatic catalog discovery.

Karol next receives the packet's original QA update and contributor prompt. Submit
a named proposal, retain full candidate/base, and ask Marvin to review the exact
candidate and its originals. Marvin explicitly chooses whether to accept the
reviewed draft through `brain accept --commit --base`. Karol independently syncs
and rebuilds only the disposable index when needed. Follow the
[employee runbook](https://github.com/MarvinAmador7/portable-kb/blob/agent/groundray-skill/docs/groundray-pilot.md)
for original-byte preservation and blank session records. The supplied business
records remain fictional and unverified by real humans.

## Active Codex home and publisher business question

The publisher diagnosed a separate plugin registration context: the earlier
installation used an Orca-managed Codex home, while the terminal at the default
Codex home listed no Groundray installation despite plugin support being enabled.
Registering the existing marketplace and plugin in that active home, without
changing HOME/CODEX_HOME, made the subsequent fresh namespaced verification work.
Preserve both contexts and all existing plugins, brains and QMD configuration.
The verification reports no brain/index changes; unrelated doctor warnings about
unmanaged skill copies and a legacy demo brain were left intact.

Next, in a fresh native chat, use the original owner question with only the
plugin invocation corrected:

> Use $groundray:groundray. I own Mosaic Studio. What should I tell Lumen about
> price and launch, and what October profitability should I use in our review?
> Tell me what needs deciding now and whether Tint is affected. As of fictional
> November 9, 2026.

Retain the unedited answer and trace. The publisher should open its original
evidence links and record the passages actually inspected. Business answering,
human source inspection, Karol’s installation/access, contribution, exact review,
publication and independent sync remain pending.

## First publisher business attempt: discovery blocked again

The publisher supplied the original business-question attempt from Codex
`0.161.0`, following the successful read-only setup on `0.151.0`. The new session
reports `$groundray:groundray` absent, searches manually and through plugin
management, and returns unresolved questions without inspecting Mosaic sources.
Three hook failures with exit code 127 are visible; no hook command is shown, so
neither their cause nor a link to Groundray discovery is established. See the
[separate failed business-attempt receipt](publisher-business-attempt-v1.json).
The successful earlier setup remains intact; this failure does not establish
that the brain or QMD index is missing or damaged.

The subsequent terminal diagnostics show the Homebrew Codex executable at
version `0.161.0`, default CODEX_HOME, plugin support enabled, and zero Groundray
installed/available entries. The earlier working executable was the user-local
`0.151.0` CLI. The cause of the missing registration and launch method remain
unconfirmed. Upstream `rust-v0.161.0` CLI source still supports local marketplace
registration and installation. Next, register the existing package using the
exact active Homebrew executable and observe its listing before a fresh session. Do not infer the upgrade caused this failure, reinstall
the brain, change provider settings, disable unrelated plugins, or change
HOME/CODEX_HOME to bypass diagnosis. Preserve this attempt as a discovery
failure; any later business response is a separate trial.

## Recovered plugin; current settings blocker

The original local marketplace directory no longer exists on the publisher Mac.
The publisher downloaded the same ARM package from CI run `38446836188`,
verified its archive checksum, and registered/installed/enabled dev.2 with the
Homebrew CLI from the new persistent `~/groundray-pilot-recovery/marketplace`.
Keep that directory as the current local marketplace source. Its disappearance
was observed; why it disappeared remains unknown.

A fresh second business-question attempt now reads the packaged workflow and
passes the visible helper check (`pkb 0.2.0`). Company access then stops:
`brain list --json` and `doctor --json` report the default Portable KB
`config.yaml` missing or not a regular file. The session reads the setup skill
and returns no supported business answer. See the
[new attempt receipt](publisher-business-attempt-v2.json); unrelated private
process listings are omitted. Hook failures (exit 127) still show no command
and remain undiagnosed.

The prior successful QMD setup is historical evidence, not proof of current
configuration availability. Inspect current XDG selectors and the known
configuration/data/cache paths before recovery; compare the same Mac/user
context. Preserve any surviving QMD configuration, brains and index. Do not
blindly rerun setup with the builtin default or re-add/reset the company. The
authorized source URL remains `https://github.com/fullkontrol/groundray-pilot-mosaic.git`,
so a source need not be invented or requested again. Any eventual reconfiguration
must explicitly retain QMD and preserve existing data. Business answering and
human original-source inspection remain incomplete.

## Current installation: selected brain, QMD executable missing

Read-only publisher diagnostics now confirm default XDG selectors and absence
of the default settings file, Portable KB data directory and Mosaic QMD index.
Whether this is the same Mac as the earlier successful verification remains
unconfirmed. The next native setup session saves explicit QMD keyword settings,
installs the authorized private company and selects `mosaic-studio`. It reports
a valid, clean brain matching hosted commit
`259fea0d4a3006f5450d0705f07bc868b688ae39`. The
[new setup receipt](publisher-native-setup-v3.json) preserves the uploaded trace
hash and results. An erroneous `brain use --json` invocation fails and is then
recovered with plain `brain use`; both outcomes remain recorded.

QMD is absent from PATH and checked usual locations. The scoped index build
fails with the explicit missing-QMD error. Current index commit is null and
index status is missing; setup is incomplete for keyword search. Nothing is
reported published or pushed. Existing state is reported preserved; the worker
has not independently inspected the private brain or full status JSON.

The supported manual dependency is `@tobilu/qmd@2.8.3`, the real-QMD CI pin,
whose npm metadata requires Node.js 22 or later. Install that dependency using
the publisher’s normal Node/npm environment, verify it with doctor, then build
only the Mosaic index. No automatic QMD installer is added to Groundray. Preserve
QMD keyword mode and the installed company; do not rerun brain installation.
Hook failures and unmanaged skill warnings remain separately undiagnosed.
Business answering and actual human source inspection are still pending.

## Current next step: bundled keyword engine

The publisher declined a separate QMD installation. QMD is optional: dev.2
already bundles the builtin Tantivy keyword engine. The earlier QMD preference
was carried into a current Mac context that had no QMD executable. Continue
using the user-selected builtin keyword provider, preserving the installed
`mosaic-studio`, configured data/cache roots, all other brains and credentials.
Build only the Mosaic derived index and verify that its commit matches the
installed brain. This provider switch and index build are authorized next steps,
not observed outcomes yet. The earlier QMD setup/error traces remain intact.
A user with an existing working QMD configuration keeps it; this selected switch
applies to the publisher’s current incomplete installation. No extra dependency
is required for the bundled engine, and no QMD installation or download should
be introduced to complete this pilot.
