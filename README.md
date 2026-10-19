# Groundray

[![CI](https://github.com/MarvinAmador7/groundray/actions/workflows/ci.yml/badge.svg)](https://github.com/MarvinAmador7/groundray/actions/workflows/ci.yml)

**Company answers, with evidence you can inspect.**

Groundray helps your team and its AI agents work from a portable company
brain: decisions, procedures, definitions, and original records kept in
Markdown and Git. Ask a business question, inspect the evidence, and propose
updates as your company learns.

[Get started](#get-started) · [How teams use it](#how-teams-use-it) ·
[Documentation](#documentation) · [Releases](https://github.com/MarvinAmador7/groundray/releases)

> What can we tell this customer about price and launch? Which numbers belong
> in our review, and what still needs a decision?

Groundray's workflow is **answer → evidence → guidance**:

- **Answer:** a direct conclusion scoped to the company and question.
- **Evidence:** the records, definitions, calculations, and source versions
  behind consequential claims.
- **Guidance:** what to check next, who needs to decide, and what remains uncertain.

Use it to recover the reasoning behind a decision, find the current procedure,
reconcile conflicting figures, or prepare a customer response with its supporting
records. When the evidence is incomplete, keep that gap visible.

## Get started

### In Codex

Install the plugin on **macOS or Linux, Intel or ARM**. You need Git and an
installed Codex CLI; the package includes Groundray's CLI and keyword search
engine. No separate Python, Node, QMD, or model download is required.

```sh
curl -fsSL https://github.com/MarvinAmador7/groundray/releases/latest/download/install-groundray | sh
```

Start a fresh Codex session using the executable selected by the installer.
Connect an existing Groundray brain, replacing the URL below with your company's
brain repository:

```text
Use $groundray:groundray-setup to connect my company brain from <repository-url>.
```

Then ask a question:

```text
Use $groundray:groundray. What can we promise this customer about price and
launch? Show the evidence and what still needs a decision.
```

### In Claude Code

Use the same native package with an installed Claude Code CLI:

```sh
curl -fsSL https://github.com/MarvinAmador7/groundray/releases/latest/download/install-groundray | sh -s -- --host claude
```

Start a fresh Claude Code session, then connect your brain and ask:

```text
/groundray:groundray-setup Connect my company brain from <repository-url>.
/groundray:groundray What can we promise this customer about price and launch?
Show the evidence and what still needs a decision.
```

A company brain is a separate Git repository. To create your first one, use the
CLI below. See the [plugin guide](docs/groundray-plugin.md) for choosing a host
executable, upgrading, and removing the plugin.

### From the terminal

Install the standalone CLI:

```sh
curl -fsSL https://github.com/MarvinAmador7/groundray/releases/latest/download/install | sh
export PATH="$HOME/.local/bin:$PATH"
groundray --version
```

Create a brain and capture your first draft through the guided workflow:

```sh
groundray setup
groundray brain init ./team-brain --name "Team" --slug team --no-publish
groundray knowledge create --brain team
```

For example, name the entry **Customer onboarding** and supply its supporting
sources when prompted. Index the saved knowledge, then search it:

```sh
groundray search index team
groundray search query "customer onboarding" --brain team --json
```

Setup can also install the standalone agent workflow for **Codex, Claude Code,
or both**. See the
[CLI guide](docs/cli.md) for connecting an existing brain, reading original
sources, and authoring changes.

## How teams use it

1. **Ask from the right company.** Work from a selected brain and an inspectable
   saved version. Keep different companies and their definitions separate.
2. **Inspect the evidence.** Follow citations to records and original sources.
   Keep facts, forecasts, and recommendations distinct.
3. **Propose an improvement.** Capture new evidence or draft a correction.
   Preview the changes and preserve the earlier reasoning and history.
4. **Review and share.** Review the exact proposal, explicitly publish the
   accepted version, then sync it on another installation.

Brains stay in your Git repositories. Search runs locally, and indexes are
rebuildable. Publishing and syncing are explicit; repository access uses your
Git host's permissions. Business approval remains a company decision.

See [reviewed collaboration](docs/brain-collaboration.md) and the
[authoring handbook](docs/authoring-handbook.md) for the complete workflow.

## Status

**Early release: 0.3.1.** The Codex and Claude Code plugins, standalone CLI, original-source
retrieval, and proposal/review/publish/sync workflows are implemented. Native
packages and installers are tested on all four supported platform combinations.
Real employee handoffs and the human evidence-review experience remain pilot
work; see the [pilot record](docs/groundray-pilot-readiness.md).

Retrieval currently uses local keyword search. New setups include the builtin
engine; existing QMD configurations are supported. The
[roadmap](docs/roadmap.md) covers future capabilities.

Upgrading from Portable KB? See the
[0.3.0 migration notes](docs/releases.md#030-groundray-rename) for renamed commands
and configuration paths.

## Documentation

| Start here | Details |
| --- | --- |
| [Plugin guide](docs/groundray-plugin.md) | Codex and Claude Code installation, company setup, upgrades, and removal |
| [CLI guide](docs/cli.md) | Brains, search, source capture, edits, sharing, and diagnostics |
| [Release guide](docs/releases.md) | Downloads, checksums, version pins, and migration |
| [Product direction](docs/groundray-product-goal.md) | Product contract, milestones, and acceptance criteria |
| [Evaluations](docs/agent-cli-evals.md) | Reproducible agent trials, evidence, scoring, and related benchmarks |
| [Development](docs/development.md) | Contributor setup, native builds, tests, and architecture |

## License

[Apache License 2.0](LICENSE).
