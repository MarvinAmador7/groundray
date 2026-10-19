# Groundray plugin

Groundray packages the answer → evidence → guidance skill, onboarding, a native
Portable KB CLI and the builtin Tantivy keyword engine. Company brains stay in
separate Git repositories and employee storage. No Python, Node, QMD or model
download is needed to use the package. Git and an installed Codex CLI are required.

Groundray plugin **0.2.1** ships with Portable KB **0.2.1**. The portable
[root manifest](../plugins/groundray/plugin.json) follows the
[official plugin layout](https://developers.openai.com/plugins/build/plugins).
The plugin defines no hooks, MCP server, authentication service or background sync.

## Install or update

On macOS or Linux, Intel or ARM, run this single line in the terminal you use for Codex:

```sh
curl -fsSL https://github.com/MarvinAmador7/portable-kb/releases/latest/download/install-groundray | sh
```

The installer downloads the platform archive and release checksum, checks the
bundled runtime, and installs the marketplace persistently under
`$XDG_DATA_HOME/groundray/marketplace` or `~/.local/share/groundray/marketplace`.
It prints the selected Codex executable and active Codex home, then registers
`groundray@groundray`. It does not change HOME/CODEX_HOME, shell profiles,
company settings, providers, brains or credentials. An existing working QMD
configuration stays intact; new company setup defaults to builtin keyword search.

For a version pin and an explicit Codex executable, use:

```sh
curl -fsSL https://github.com/MarvinAmador7/portable-kb/releases/latest/download/install-groundray | sh -s -- --version v0.2.1 --codex /opt/homebrew/bin/codex
```

`--install-dir DIRECTORY` changes the persistent package root. Reuse that root
on upgrades. Existing managed packages are retained in `.previous.*` directories;
unmanaged directories and symlink destinations are refused. A failed download,
checksum or runtime check leaves the previous package intact. Host-registration
errors retain the verified package for retry. The installer never removes other
plugins. When the former `groundray@groundray-dev` is installed in this same
Codex profile, it removes that development plugin only after the new plugin is
installed; its old marketplace registration and source directory remain available.

Start a **fresh Codex session using that executable**. Setup uses
`$groundray:groundray-setup`; business questions use `$groundray:groundray`.
Codex prefixes plugin skills with their plugin name. Choosing another Codex
binary/profile can expose a different plugin catalog. Do not change auth homes
or copy credentials to repair discovery. Codex **0.161.0** is the pinned host in
installation tests; the package must be installed/enabled in the session's catalog.

The release also includes standalone `pkb` archives and the existing
[CLI installer](releases.md). Installing standalone `pkb` alone does not register
the Groundray plugin. Checksums detect byte changes; they do not authenticate a sender.

## Company workflow

Ask the installed setup skill to select an existing company or install an
explicitly authorized repository. Preserve existing configuration and other
brains. With no prior configuration, builtin keyword search uses the bundled
engine; QMD is optional and is never installed automatically.

When inspecting operations manually, resolve the quoted absolute
`scripts/groundray` helper from the installed skill. Below, `$GROUNDRAY` is that
path, not a separate executable you must install:

```sh
"$GROUNDRAY" check
"$GROUNDRAY" doctor --json
"$GROUNDRAY" brain list --json
"$GROUNDRAY" brain add COMPANY_GIT_URL --json
"$GROUNDRAY" brain use COMPANY_SLUG
"$GROUNDRAY" search index COMPANY_SLUG --json
"$GROUNDRAY" search query 'customer launch' --brain COMPANY_SLUG --json
```

Run setup only when needed, use the resolved slug explicitly, and synchronize
only when requested. `brain use` has no `--json` option. Ask for a direct answer,
inspectable evidence and guidance. Inspect consequential originals and keep the
source commit beside each citation. A summary is not an original inspection.

For contributions, attach a checked authoring clone, capture authorized records,
preview changes and submit a proposal. Review the exact candidate and originals,
then explicitly accept its pinned commit/base through existing Git permissions.
Another employee independently syncs and rebuilds only the disposable index.
See [reviewed collaboration](brain-collaboration.md). Publication grants no
pricing/launch authority or human verification.

## Compatibility and startup

Every bundled invocation verifies the exact runtime SHA-256 and refuses missing
files, malformed checksum entries, symlinks and tampering. `check` in current
runtimes checks the registered source/edit/proposal commands in one process.
Compatible older 0.2.x runtimes retain the explicit command probes; a matching
version alone is insufficient. `GROUNDRAY_PKB` explicitly selects an external
executable for source development/tracing and is not bundled checksum binding.
The installer checks its bundled runtime independently of that override.

Groundray has no agent hooks. The publisher's earlier `Hook failed` exit-127
messages did not identify a command/owner, and the latest report says they are
not reproducing. Preserve those historical failures; do not disable unrelated
hooks or plugins without identifying the failing owner. Slow native startup was
reported in the earlier one-file package; the current check removes ten repeated
runtime launches. Platform-specific timings require actual measurements.

## Remove

Use the same Codex executable/profile that installed the package:

```sh
codex plugin remove groundray@groundray --json
codex plugin marketplace remove groundray --json
```

These commands unregister the plugin and its dedicated marketplace. They do not
remove company data, authoring clones, indexes or credentials. The persistent
package and previous versions remain on disk for explicit cleanup. Standalone
Portable KB skills are preserved.

## Build and validation

Build on the target machine with Python 3.11+, Rust 1.90 and PyInstaller. Use a
virtual environment with the current wheel installed:

```sh
cargo build --release --locked
python -m pip install 'build>=1.2,<2' 'pyinstaller>=6.19,<7'
python -m build --wheel
python -m pip install dist/*.whl
python scripts/freeze_groundray_cli.py --native target/release/pkb-search --output ./build/groundray-cli
python scripts/build_groundray_plugin.py --cli ./build/groundray-cli/dist/pkb --output ./build/groundray-marketplace
```

Use new build output directories. The output contains the marketplace, a ZIP,
a release tar archive and checksums. Archives exclude employee credentials,
brains and settings. Canonical skills generate the packaged views through
`python scripts/build_groundray_plugin.py --sync-skills`; drift tests enforce them.

Native release jobs validate all four platform archives, the 25-operation
packaged collaboration smoke and persistent installation/reinstallation with a
real isolated Codex host. No model or authenticated employee role is simulated.
[Earlier package trials](groundray-plugin-evaluation.md) and the
[publisher pilot record](groundray-pilot-readiness.md) retain their original
failures and later successful native answer. Publisher personal source inspection
and Karol's real hosted contribution/review/sync remain incomplete. A supported
synthetic answer is not evidence of measured accuracy or productivity gains.
