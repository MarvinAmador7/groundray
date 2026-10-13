# Astra textual review

Read-only review by the explicitly requested gpt-6-astra subagent. No model evaluation,
reviewed-code execution, tests, network or evaluation-output inspection.

## Original review

Two actionable defects from textual review:

- **[P2] Dangling bundled-runtime symlink silently falls back to PATH.** At scripts/groundray:7, `-e` is false for a dangling `runtime` symlink, so the explicit symlink rejection below is unreachable and the wrapper chooses another `pkb`. This contradicts the documented compatibility failure behavior. Enter the bundled-runtime validation branch when either `-e` **or** `-L` is true.
- **[P2] Checksum validation does not require a checksum for the executed binary.** At scripts/groundray:16, the wrapper verifies whatever entries `SHA256SUMS` contains, then executes `runtime/pkb`. A malformed manifest containing a valid checksum for another existing file passes without checking `pkb`. Require the manifest’s expected `pkb` entry and verify that exact binary. The current builder emits the correct entry, but the installed wrapper does not enforce it.

The relative skill references resolve correctly. The instructions preserve company scope, existing configuration/providers, credentials and brains, and separate installation, local edits, proposals, publication, synchronization and human verification. No additional actionable defects found in those boundaries.

This was a read-only textual review under repository `AGENTS.md`; no execution of reviewed code, tests, network, model runs or evaluation-output inspection.

## Follow-up after fixes

Both original findings are addressed in the updated source:

- Wrapper:7 catches dangling `runtime` symlinks. The package marker also makes a missing bundled runtime fail instead of falling back to PATH.
- Wrapper:17 requires the expected lowercase SHA-256 entry for `pkb`, hashes that executable directly, and rejects mismatches.
- Builder:104 creates the marker in the staged package, which the archive includes.

No remaining actionable issue found in this change. Preserve the original findings as resolved by this follow-up. This conclusion is textual review only; no execution, tests, network, edits or evaluation-output inspection.
