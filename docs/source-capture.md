# Original source records

The source-tree CLI supports **plan-first UTF-8 capture and saved-version reading**
through `pkb source capture` and `pkb source get`. These commands are implemented
on the draft Groundray branch, not yet included in a tagged release. They preserve
original evidence separately from the wiki's governed explanations. No KB profile
field, concept type or lifecycle status changes.

## Capture a supplied record

```console
pkb source capture ./owner-rules.md \
  --path references/captures/owner/owner-rules.md \
  --actor openai/codex \
  --title "Supplied company rules" \
  --origin "Owner reply supplied for this question" \
  --brain company --json
```

The command returns a validated plan with file diffs and changes nothing. Repeat
with `--apply` to save the captured copy, receipt, preservation rules and update-log
entry in one local commit and refresh the installed snapshot. It never publishes
to the organization or changes the source file you supplied. The returned
`get_command` and `reindex_command` retain explicit brain/config/date scope.

`--path` selects a new lowercase portable path under `references/captures/`.
Without it, the CLI derives a readable filename from the supplied basename.
Markdown destinations gain `.txt`, so this example saves
`references/captures/owner/owner-rules.md.txt`. The original filename remains in
the receipt. This prevents source Markdown from being mistaken for a governed
concept; it does not rewrite the source, wrap it in frontmatter, or repair links
inside an imported document.

Input must be a regular UTF-8 text file of at most 1 MiB. Markdown, TXT and CSV
records are supported as text; binary documents, extraction and bulk wiki import
remain outside this command. CRLF, a BOM, Unicode and unknown source frontmatter
are retained byte-for-byte. NUL-containing input, symlinks and unsafe destinations
are refused.

Captures are append-only through this interface. If a destination or its receipt
exists, choose a new revision path; no overwrite, automatic merge or semantic
supersession occurs. Creating a revised capture does not automatically revise
the claims that cite an earlier one. Use the existing material knowledge-update
workflow to explain the new evidence and update only the applicable dependents.

## What a receipt means

Each copy has an adjacent `.capture.json` receipt recording stored path, original
basename, title, byte count, SHA-256, actual capture actor/time and optional
caller-supplied origin. The default actor is `process:portable-kb`, the CLI process;
agents can supply their real producer identity with `--actor`.

The actor captured a copy; the receipt does not identify that actor as the original
author, authenticate the stated origin or record human verification. A copied
conversation report remains a report. Capturing it neither makes it an approved
business decision nor strengthens its assertions.

Git preservation rules are explicitly included in the plan under the capture
directory. They disable line-ending conversion, filters, keyword expansion and
working-tree encoding for these artifacts. The save step checks effective rules
before committing. Existing conflicting rules are preserved and reported instead
of silently replaced. Copies are checked against their planned bytes in the saved
Git blob before activation.

## Read the saved evidence

Read a managed capture directly:

```console
pkb source get references/captures/owner/owner-rules.md.txt \
  --brain company --json
```

Or select a local source declared by a knowledge item:

```console
pkb source get wiki/customer-pricing.md owner --brain company --json
```

Here `owner` is the item's `sources[].id`. Item-relative and bundle-root source
resources both work. For knowledge creation, the capture result supplies a
`source_entry` containing diagnostic title and a bundle-root resource such as
`/references/captures/owner/owner-rules.md.txt`; add the item-local `id` used by
the body's footnotes. Body links should use portable item-relative paths, such as
`../references/captures/owner/owner-rules.md.txt` from a page under `wiki/`.

Both reads require a clean, identity-matched, valid installed brain at its catalog
pin; they need no keyword index. The response contains full saved UTF-8 content,
byte count, SHA-256 and a brain/path/commit citation. Declared-source reads also
include the citing item's pinned citation. Managed captures require a matching
receipt; declared legacy local records outside the managed directory can be read
without one, with `capture_receipt: null`. External URLs are not fetched. A declared
fragment is reported, not validated or used to select an excerpt: the response is
the complete source file.

Reading neither syncs nor writes. Capture advances the local brain version, so an
existing keyword index needs an explicit rebuild before searching. Other employees
remain on their installed version until an explicitly published update is synced.

## Failure behavior

A dirty authoring/installed tree, changed plan base, existing destination, unsafe
path or invalid proposed bundle stops capture. If writing or committing fails
before a new commit exists, the operation restores only its own matching file
changes and staging paths. Concurrent replacements are retained. If history
advances concurrently, capture does not force-reset it; inspect the unfinished
local state before continuing.

If a local commit succeeds but activation fails, the error names the saved commit
and keeps the prior installed version. The local capture remains recoverable.
For a local-source installation, explicit `brain sync` can retry activation after
the blocker is resolved. Remote-installed authoring and a general local activation
recovery interface remain separate integration work. Receipt mismatches and missing
or non-UTF-8 saved records are reported; no silent repair or transcoding occurs.

The [CLI-only Mosaic demonstration](groundray-cli-sources.md) exercises capture,
installation, source inspection, native discovery and explicit sync. See also
[the CLI reference](cli.md), [Groundray's goal](groundray-product-goal.md) and
[the original engine-fit study](groundray-engine-fit.md).
