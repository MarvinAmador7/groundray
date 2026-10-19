---
name: groundray-setup
description: Set up Groundray's compatible CLI and select or install an explicitly supplied company brain. Use when starting Groundray, checking its installation, or receiving company updates.
---

# Set up Groundray

Use the plugin's `scripts/groundray` executable, resolving its path relative to
this skill: `../../scripts/groundray`. Quote absolute paths. Run it with `check`
first. It checks version and required commands without changing a brain. A
matching version alone is insufficient. If incompatible or missing, report the
actual blocker and use a compatible bundled package; do not download a guessed
release or change credentials. A source-only plugin can use a compatible `groundray`
on PATH, or an explicitly selected `GROUNDRAY_CLI` executable.

Read the bundled storage workflow at `../groundray/references/storage/SKILL.md`.
Run `scripts/groundray doctor --json` and `brain list --json`. Existing configuration
and brains belong to the employee. Keep configured providers and existing brains;
do not reset setup just because another provider is absent. If unconfigured,
complete the supported `setup` workflow using the user's supplied preferences.
No embedding models or QMD installation is required for builtin keyword search.

When a company is named, resolve its installed slug once and use that scope on
every operation. Ask for its repository only if needed. Install an explicitly
supplied authorized source through `brain add`; select through `brain use` only
when selection is requested. `brain use` takes no `--json` option. Receive updates through `brain sync` only when
requested, and rebuild only the selected derived index when missing/stale.

Explain the selected company, installed version and any real blocker. Installation
and selection grant no publication, business approval or human verification.
Updates of the plugin/CLI do not update company records. Company publication and
employee sync remain separate explicit operations. Plugin uninstall removes only
its plugin cache; never delete company data, indexes, credentials or authoring
clones as part of plugin cleanup.
