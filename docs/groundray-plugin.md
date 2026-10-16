# Groundray development plugin

Groundray packages the answer → evidence → guidance skill, an onboarding skill,
and the compatible Portable KB storage workflow. A self-contained development
bundle also carries `pkb` and its native Tantivy engine. Company brains stay in
separate Git repositories and local employee storage.

This is an unreleased Codex-first package, version `0.1.0-dev.2`. The portable
[root manifest](../plugins/groundray/plugin.json) follows the
[official plugin layout](https://developers.openai.com/plugins/build/plugins).
No connector, MCP server, hook, authentication service or background sync is included.
The existing released CLI installer does not install this plugin.

## Build and install

Build on the target machine; cross-labeling a binary is refused. Git, Python
3.11+, Rust 1.90 and PyInstaller are build prerequisites. Git is a runtime
prerequisite; the self-contained runtime needs no Python installation or models.
Use a virtual environment with the current wheel installed, preserving your
normal HOME, Codex credentials and network configuration:

```sh
cargo build --release --locked
python -m pip install 'build>=1.2,<2' 'pyinstaller>=6.19,<7'
python -m build --wheel
python -m pip install dist/*.whl
python scripts/freeze_groundray_cli.py --native target/release/pkb-search --output ./build/groundray-cli
python scripts/build_groundray_plugin.py --cli ./build/groundray-cli/dist/pkb --output ./build/groundray-marketplace
```

Both build outputs must be new directories. The marketplace directory includes
`plugins/groundray/`, `.agents/plugins/marketplace.json`, a ZIP and its SHA-256.
For a transferred archive, verify its checksum, then use `unzip` to preserve
executable modes. Checksums detect byte changes; they do not authenticate a sender.
The archive does not contain employee credentials, brains or local settings.

Install from the extracted marketplace's absolute path:

```sh
codex plugin marketplace add /absolute/path/groundray-marketplace --json
codex plugin add groundray@groundray-dev --json
codex plugin list --marketplace groundray-dev --json
```

Native installation was exercised with Codex `0.159.0-alpha.3`. Use a new chat
and invoke `$groundray:groundray-setup` for setup or `$groundray:groundray` for
answers. Codex prefixes plugin skill names with the manifest's plugin name;
the bare `$groundray-setup` is not the registered plugin skill name. The onboarding
and main instructions are shipped as skills. Native automatic invocation still needs a successful
model-backed chat test: this cloud environment blocks the native Codex response
endpoint with HTTP 403. Foreground evaluation agents explicitly read the native
installed files; that is separate evidence from automatic activation.

The publisher's real Codex `0.151.0` setup session ran successfully through a
manual file fallback after the earlier guide supplied the bare setup name.
Its collapsed transcript reports the expected Mosaic commit and a current index
using the existing QMD provider. One unsupported `brain use --json` attempt was
recovered in-session. Correct namespaced invocation and active plugin context
still need observation; do not count that fallback as automatic skill discovery.

## Company workflow

Resolve the installed plugin's quoted absolute `scripts/groundray` helper. Below,
`$GROUNDRAY` denotes that path, not a new global executable installation:

```sh
GROUNDRAY=/absolute/path/to/installed/plugin/scripts/groundray
"$GROUNDRAY" check
"$GROUNDRAY" doctor --json
"$GROUNDRAY" brain list --json
"$GROUNDRAY" brain add COMPANY_GIT_URL --json
"$GROUNDRAY" brain use COMPANY_SLUG
"$GROUNDRAY" brain sync COMPANY_SLUG --json
"$GROUNDRAY" search index COMPANY_SLUG --json
"$GROUNDRAY" search query 'customer launch' --brain COMPANY_SLUG --json
```

Run setup only when configuration is absent; preserve existing search providers.
Use the company slug explicitly. Ask the agent for a direct answer, inspectable
evidence and practical guidance. Retrieve complete items and consequential
originals; a successful search or a declared source is not original inspection.
An agent should name the company and cited commit, preserve estimates and actual
scoped approvals, and attribute claims whose originals cannot be inspected.

When asked to contribute, attach a clean clone with the same fetch/push source,
capture supplied originals, preview changes and create a proposal. Another
employee reviews the exact candidate and reads its original sources. A publisher
explicitly accepts the reviewed candidate/base; the second employee syncs and
rebuilds their disposable index. See the bundled storage references and
[reviewed collaboration](brain-collaboration.md) for exact command syntax.
Git publication grants no pricing/launch authority or human verification.

## Compatibility, updates and removal

The helper accepts `pkb 0.2.x` only after probing every required source, editing
and proposal command. Released `0.2.0` and this draft report the same version;
version alone cannot establish compatibility. Bundles validate the exact runtime
binary checksum and reject missing files, malformed checksum entries, symlinks
and tampering. A source-only checkout can use an explicitly installed compatible
`pkb` on PATH. `GROUNDRAY_PKB` explicitly selects an external executable, including
the evaluator's tracing shim; that mode is not a claim of bundled checksum binding.

To replace a local development package, build/extract a new marketplace directory,
remove this plugin and its marketplace registration, then register the new directory
and add the plugin. Use `plugin list` and the helper `check` afterward. Do not
assume a local directory edit updates Codex's cached copy. Existing catalog,
configuration, company repositories and indexes belong to the employee. Updating
a plugin/CLI does not sync or publish a company brain.

```sh
codex plugin remove groundray@groundray-dev --json
codex plugin marketplace remove groundray-dev --json
```

These host commands unregister this development package. Never delete employee
brain data, authoring clones, indexes or credentials as plugin cleanup. Keep any
standalone Portable KB skills until the employee chooses to remove them.

Canonical skills are the source of the packaged views. After intentionally
changing them, regenerate with `python scripts/build_groundray_plugin.py --sync-skills`;
tests detect stale copies. Package integration CI builds Linux x86_64 and macOS
ARM, then exercises setup, installation/selection, captured CRLF originals,
proposal review/publication, independent sync, native search and resolved source
paths through the packaged helper. These are mechanical tests with zero models,
one Git identity and no business approval. Additional platform targets and real
host roles require separate validation. The [installed-package trial report](groundray-plugin-evaluation.md)
records six fresh agent runs, preserved errors and plugin lifecycle checks.
The [pilot readiness follow-up](groundray-pilot-readiness.md) adds dev.2 clickable
evidence guidance, one fresh matched compiled-only case, actual version upgrade
preservation and a ready two-person [employee pilot](groundray-pilot.md).
