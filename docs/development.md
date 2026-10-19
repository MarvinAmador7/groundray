# Development

The [standalone release](releases.md) includes the CLI and native keyword engine.
For development, use Python 3.11+, Git, and the Rust toolchain pinned in
`rust-toolchain.toml`. Run these commands from the repository root:

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -e '.[dev]'
cargo build --release --locked
export PATH="$PWD/target/release:$PATH"
```

A Python source or wheel installation needs `groundray-search` on PATH for
builtin search. Native releases bundle that executable. QMD is optional; keep
existing provider configurations when developing against a real installation.

## Checks

```sh
python -m ruff check .
GROUNDRAY_TANTIVY_COMMAND="$PWD/target/release/groundray-search" python -m pytest -q --cov=groundray
cargo fmt --all -- --check
cargo clippy --workspace --all-targets --locked -- -D warnings
cargo test --workspace --locked
sh -n install
sh -n install-groundray
```

The real-QMD integration check is opt-in and requires a separately available
compatible QMD executable; see [release validation](releases.md). Deterministic
agent-harness tests make no model calls. Actual agent evaluations are opt-in and
use the configured model/provider; see [evaluation setup and scoring](agent-cli-evals.md).
For native CLI and plugin build instructions, see [releases](releases.md) and
[plugin packaging](groundray-plugin.md#build-and-validation).

## Design and contribution guides

- [Agent instructions](../AGENTS.md): authorized scope and safe changes.
- [Architecture](architecture.md): engine and consumer boundaries.
- [Schema](schema.md), [lifecycle](lifecycle.md), and [validation](validation.md):
  the OKF-compatible knowledge profile and its local governance rules.
- [Research](research.md): upstream specification and compatibility decisions.
- [Pull-request checklist](pull-request-checklist.md): knowledge change review.
- [Roadmap](roadmap.md): implemented surfaces and deferred work.
