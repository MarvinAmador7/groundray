# Propose and review company-brain updates

Implemented on the Groundray draft branch; not released. These commands use the
existing catalog, Git credentials and validated bundle. They do not add company
roles, record business approval or bypass host branch protection.

## Attach an authoring clone

An installation from a Git URL starts as a reader. Clone the same source into a
separate working directory, inspect the installed version, then attach it:

```console
pkb brain status mosaic-studio --json
git clone <same-source-url> ./mosaic-authoring
pkb brain attach ./mosaic-authoring --brain mosaic-studio --json
pkb brain attach ./mosaic-authoring --brain mosaic-studio --apply --json
```

Attachment checks the brain ID, slug, origin, clean `main` branch, validation and
exact installed commit. It changes only the authoring pointer in the catalog;
it preserves the installed pin and active selection. Managed checkouts, nested
repositories, symlink paths and replacing another attached clone are refused.
If a fresh clone is newer than the installation, explicitly sync the installation
first. Attachment never resets, switches, merges or fetches the authoring clone.

Use existing plan-first `source capture` and `knowledge create/update/move`
commands to save work locally. The local author's installed snapshot advances;
other employees continue reading the published snapshot until an explicit sync.
`brain sync` updates the installed snapshot, not the separate authoring working
tree. Keep that clone current through an explicit Git fast-forward workflow;
local unpublished work or divergent history requires a deliberate recovery
decision before another authoring operation.

## Propose, inspect, publish

A proposal is a new branch under `refs/heads/groundray/`. Use a new name for each
revision. It contains the saved, validated commit, including its history and
original records, without advancing published `main`:

```console
pkb brain propose delivery-evidence --brain mosaic-studio --json
pkb brain propose delivery-evidence --brain mosaic-studio --apply --json
```

Both modes explicitly contact the remote. Preview checks remote freshness but
creates no branch and changes no installed version. Proposal creation refuses
an existing name, unpublished files outside the brain boundary, dirty state,
invalid content and history that does not descend from current published main.

A reviewer can use a URL-installed brain without an authoring clone:

```console
pkb brain review delivery-evidence --brain mosaic-studio \
  --commit <full-proposal-commit> --json
```

Review fetches and validates the exact proposal, checks its identity and every
changed path in the unpublished history, and returns the full patch against
current remote `main`, its `base_commit` and `proposal_commit`. It temporarily
checks out the candidate in a disposable review worktree. It leaves the installed
HEAD, catalog pin and index unchanged. The Git object cache and fetch metadata
can change; this command is read-only with respect to published and installed
knowledge. A moved proposal or a diverged/outdated proposal is refused.

Inspect the patch, source records, scope and required company approvals. The
patch is a structural inspection surface, not a guarantee that someone reviewed
it or that the claims are true. Unchanged evidence must be inspected at the
appropriate version; installed-source retrieval still uses `installed_commit`,
which review reports separately from the remote base and candidate. Do not mix
these snapshots in a business conclusion.

Only an explicitly authorized publisher should run:

```console
pkb brain accept delivery-evidence --brain mosaic-studio \
  --commit <reviewed-full-proposal-commit> --base <reviewed-full-base-commit> --json
pkb brain sync mosaic-studio --json
pkb search index mosaic-studio --json
```

`accept` validates the candidate again, checks the supplied reviewed base and
proposal commit, and publishes exactly that descendant. A Git compare-and-swap
lease refuses a changed main even when it is still an ancestor of the proposal.
The implementation uses `--force-with-lease` with an explicit expected value
**after verifying fast-forward ancestry**; it never permits rewriting published
history. Proposal creation uses an empty expected value to forbid overwriting
any existing proposal, including a concurrent creation. Users and agents should
use these checked commands rather than reproduce their Git internals.

Publication leaves the publisher's installed snapshot unchanged and reports
`needs_sync`. Other employees also sync and rebuild explicitly. Old commits
remain in Git. Proposal branches remain available; cleanup is not automatic.
If the remote accepts a push but its response is lost, inspect the remote before
retrying; an already-published proposal is refused on another acceptance attempt.

`business_approval_recorded` is always false. These commands neither change
lifecycle status nor create human verification events. Git permissions determine
who can push; company records determine who may approve a price or customer
commitment. A host rule requiring a pull request may reject `accept`; use the
host's review/merge process, then sync. The CLI does not create GitHub PRs for
brain proposals or silently bypass a refusal. Existing `brain push` remains a
separate direct publication command for explicitly authorized publishers.

## Development evidence

The [employee handoff demonstration](groundray-employee-handoff.md) exercises
these commands with two configurations and a local bare remote. It proves
mechanical transfer and tested refusal states on one Linux host. Agent usability,
real Git-host roles/protected branches and separate-computer packaging are still
open acceptance gates.
