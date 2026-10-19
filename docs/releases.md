# Release and installation

## Version contract

`src/groundray/__init__.py` is the single source of truth for the stable
`X.Y.Z` version. Hatch reads that value for Python distribution metadata, the
CLI reports it through `groundray --version`, and release assets use the matching
`vX.Y.Z` tag. Stable Groundray manifests use the same version so host cache
keys advance with every runtime release; build and regression checks refuse
version drift. A release never derives a version from a mutable branch name.

To prepare a release, change `__version__` in a focused pull request. CI tests
the proposed commit. After it merges to `main`, the release workflow checks
whether the corresponding release or tag already exists. Existing releases are
left untouched, while an orphaned existing tag fails closed for human review.

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main` with
read-only repository permissions. It performs:

- lint and the complete coverage-gated test suite on supported Linux and macOS
  Python environments;
- POSIX shell syntax validation and failure/preservation tests for both installers;
- wheel and source-distribution builds plus metadata checks;
- verification that schemas and the Groundray agent skill are in the wheel;
  and
- a clean-environment wheel install and CLI smoke test.

GitHub-owned workflow actions are pinned to exact commit SHAs. Tests require no
release, deployment credential, or writable repository token.

## Automated GitHub release

`.github/workflows/release.yml` runs after the version source changes on
`main`, and can also be inspected through a manual dispatch. A new version is
published only after the release gate passes. The workflow builds:

```text
groundray-X.Y.Z-py3-none-any.whl
groundray-X.Y.Z.tar.gz
groundray-cli-vX.Y.Z-darwin-arm64.tar.gz
groundray-cli-vX.Y.Z-darwin-x86_64.tar.gz
groundray-cli-vX.Y.Z-linux-arm64.tar.gz
groundray-cli-vX.Y.Z-linux-x86_64.tar.gz
groundray-vX.Y.Z-darwin-arm64.tar.gz
groundray-vX.Y.Z-darwin-x86_64.tar.gz
groundray-vX.Y.Z-linux-arm64.tar.gz
groundray-vX.Y.Z-linux-x86_64.tar.gz
install
install-groundray
SHA256SUMS
```

Each standalone executable and its embedded Tantivy sidecar are built on their
native GitHub-hosted runner. Before upload, it must report the expected version, complete local
setup, initialize and validate a fresh brain with the bundled schemas, and
install its bundled agent skill into an isolated temporary home. The publish
job uses only the scoped workflow `GITHUB_TOKEN` with `contents: write`, creates
the semantic tag at the tested `main` commit, generates release notes, and
uploads version-named assets. Each native job also packages Groundray from that
tested executable, exercises the 25-operation handoff, and verifies persistent
installation/reinstallation with isolated real Codex 0.161.0 and Claude Code
2.1.303 hosts before
publication. Post-publication jobs run both installers against the release on
all four target platforms. Node is a CI host-test dependency, not a requirement
for installing or using Groundray. See [the plugin guide](groundray-plugin.md).

Linux executables are built on Ubuntu 22.04 to retain compatibility with that
glibc baseline and newer compatible distributions. Alpine/musl and Windows are
not release targets in this milestone.

The workflow creates GitHub release assets; it does not publish to PyPI, alter
repository visibility, notarize a future macOS application, or install QMD.

The CI and release gates since 0.1.2 install pinned `@tobilu/qmd@2.8.3` under Node.js
24 and exercise an isolated real keyword index plus cited query. This verifies
the optional external provider without adding QMD to the standalone archive or
downloading embedding models during installation.

## Installer safety

The root `install` script requires `curl`, `tar`, and either `sha256sum` or
`shasum`. It downloads the selected archive and `SHA256SUMS` into an
operation-owned temporary directory, verifies the exact filename digest, and
stages the executable before an atomic move to `~/.local/bin/groundray` (or
`GROUNDRAY_BIN_DIR`). A failed download, missing checksum, checksum mismatch, bad
archive, or failed version check leaves the previous executable intact.

Re-running the installer upgrades to the latest GitHub release. Use
`--version vX.Y.Z` to install or restore a specific version. Explicit
`--uninstall` removes only the `groundray` executable at the selected install path;
it intentionally preserves brain repositories, configuration, indexes, and
agent skills.

Public repositories support the anonymous one-line `raw.githubusercontent.com`
command. While this repository remains private, retrieve the script and assets
with an exported `GH_TOKEN` and authenticated `gh` CLI. Repository visibility
is a separate owner decision and is never changed by CI.

## v0.2.0 release scope

This release ships a production Tantivy keyword provider as `builtin`. New
setup defaults to it; existing schema-1 QMD settings keep their provider and
command. Choose either provider with `pkb setup --search-provider builtin` or
`--search-provider qmd`. Builtin supports keyword mode only and downloads no
models. Changing provider requires explicitly rebuilding its disposable index.

Each standalone executable embeds the matching native `pkb-search` binary.
The installer still installs one checksum-verified `pkb` file, so CLI and engine
upgrade or uninstall together. The pure Python wheel requires `pkb-search` on
PATH or a configured native executable; the standalone installer is the
recommended complete installation. Rust is needed to build the source package,
not to run the standalone release.

Native release runners for Linux/macOS Intel/ARM build and test the engine,
exercise canonical positive queries and recovery/cleanup, and smoke-test native
indexing and querying through the frozen CLI before publication. These are
required release checks; local Linux validation does not establish other
platforms' success. Cross-platform benchmark targets and broader domain
judgments remain ongoing evaluation work.

Python indexes only a healthy pinned brain. It checks engine/index versions,
brain identity and commit, leased section records, safe canonical paths, exact
section content and lifecycle metadata before producing citations. Full
rebuilds publish atomically; automatic post-build cleanup retains current and
active reader generations. Brain removal acquires native reader leases before
its existing catalog/quarantine transaction; active readers make removal fail
without changing the catalog or checkout.

The release also adds read-only `pkb search evaluate` for labeled relevance,
canonical citation checks, ranking stability, and end-to-end latency. Source
artifacts include the QMD/SQLite/Tantivy comparison and deterministic scale
corpora generator. SQLite remains a benchmark baseline. Semantic/hybrid
retrieval and model downloads remain deferred.

All earlier CLI safety changes since the last published v0.1.0 are included,
including conversational capture safeguards, brain removal and diagnostics,
and skill drift handling. See the merged changes and
[CLI hardening notes](production-hardening-0.1.2.md).

Standalone builds verify that installed Python code, schemas, and the bundled
skill match the checkout before freezing. Reinstall the current wheel when
changing source; a matching version string alone does not establish current
build inputs. The frozen smoke test also checks installed skill content.

## 0.2.1: Groundray distribution

This release includes Groundray plugin 0.2.1, its bundled keyword engine and the
source/proposal operations merged in #16. The standalone CLI retains compatible
0.2.x behavior. The plugin compatibility check now inspects registered commands
in one runtime launch, retaining explicit probes for older compatible binaries.
The dedicated installer keeps its source under persistent employee storage,
reports the selected Codex executable/profile, preserves company state and
upgrades only the former Groundray development plugin.

The retained publisher trial uses a fictional company. Human source inspection
and Karol's hosted handoff are still follow-up work; this release does not claim
a completed human pilot or publisher-only permissions in the selected
unprotected contributor repository.

## 0.3.1: Claude Code plugin

The same native Groundray release now installs in Codex or Claude Code. Select
Claude with `install-groundray --host claude`; use `/groundray:groundray-setup`
and `/groundray:groundray` in a fresh session. Each host has its own native
manifest and marketplace catalog, sharing one pair of skills and bundled CLI.

Claude installation uses the current profile's user scope, validates manifests,
refreshes the exact installed version, and preserves unrelated plugins,
permissions, credentials and company state. No separate Python, Node or QMD is
required beyond the chosen host and Git. Canonical authoring guidance now uses
the actual agent producer/version rather than a Codex-only example actor.
Native host checks make no model calls; they do not establish Claude answer
quality, personal source inspection or a completed employee pilot.

## 0.3.0: Groundray rename

The repository is `MarvinAmador7/groundray`. This intentionally breaking release
uses `groundray` for the executable, Python distribution and import package.
The native sidecar is `groundray-search`; development environment variables use
`GROUNDRAY_`. No `pkb` command or `portable_kb` import alias is installed.

New configuration, brain storage and disposable cache defaults are
`~/.config/groundray`, `~/.local/share/groundray` and `~/.cache/groundray`, with
the existing XDG overrides. Old Portable KB directories are not moved, deleted
or implicitly selected. For an existing configuration, pass its path explicitly
to the operation, for example:

```sh
groundray doctor --config "$HOME/.config/portable-kb/config.yaml" --json
```

Existing QMD provider settings remain valid. A builtin configuration with the
old `pkb-search` command needs explicit reconfiguration to `groundray-search`.
Brain content, identities and OKF schema semantics are unchanged.

Standalone CLI archives use `groundray-cli-vX.Y.Z-TARGET.tar.gz`; Codex plugin
archives use `groundray-vX.Y.Z-TARGET.tar.gz`. The `install` script installs the
CLI with `GROUNDRAY_BIN_DIR` as its optional destination override;
`install-groundray` registers the plugin with `GROUNDRAY_INSTALL_DIR` as its
persistent package root. Both installers default to the renamed repository.
The standalone agent workflow is `groundray-storage`; the Codex plugin retains
`groundray@groundray` and `$groundray:groundray` / `$groundray:groundray-setup`.

The current installers target the renamed 0.3.x interfaces. To restore a
pre-0.3 version, use the installer attached to that historical release.

Earlier tags, release assets, frozen pilot packets and retained evaluation
records keep the names and bytes used when they were produced. Run traces
remain historical evidence, not observations of the renamed release.
