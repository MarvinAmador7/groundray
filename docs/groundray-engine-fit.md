# Groundray Lite and engine: first storage fit

**The existing engine can distribute and retrieve a small Groundray-style company
brain without a spec change. Raw source capture/read support still needs a product
interface.** This is the G0 development demonstration, not a completed employee
collaboration workflow or a new Groundray Lite agent evaluation.

Follow-up: [supported source commands](groundray-cli-sources.md) now replace this
demonstration's manual copying/development reader on the draft branch. The original
construction and its traces below remain unchanged.

The [Mosaic snapshot](../examples/groundray-mosaic/README.md) contains three linked
pages covering Lumen pricing, October contribution margin and launch/Tint scope.
They retain ordinary Markdown prose, relative source links and wikilinks. The
existing CLI generates draft identity, provenance, indexes and history. Original
records remain separate, with no added frontmatter or rewritten contents.

## What ran

The source-tree CLI ran with isolated author/reader configurations and a real
native Tantivy sidecar on one Linux host. The distribution source was a local Git
repository. The root agent authored the three page bodies and directed the commands;
no fresh agent executed Lite, no human reviewed the pages and no remote permission
or protected-branch process was exercised. The unchanged Lite skill is a reference
for the intended behavior, not a measured participant in this run.

| Observed operation | Outcome |
| --- | --- |
| Initialize a separate company repository | Manifest, empty valid bundle and local installation created through `brain init`. |
| Seed fictional source copies | 21/21 byte-identical records; mapping and SHA-256 receipts retained. This is development fixture preparation, not a production import command. |
| Create three linked pages | CLI plans then explicit applies; generated UUIDs and honest agent provenance; all remain draft with no human verification. |
| Install into a second isolated configuration | Same Git version, sources and relative links recovered. |
| Discover and retrieve | Native queries for retainer, margin and AX-7 recover the intended pages; complete-item and root-index reads work. |
| Inspect raw evidence | 12 declared-source reads across 10 distinct files through a development adapter; hashes match originals and citations pin the installed commit. |
| Revise one page and explicitly sync | Reader keeps the old version until sync; material update preserves item identity; earlier body remains in Git history. |
| Search after sync | Stale index is refused; explicit rebuild restores search. |

The completed construction recorded 54 commands, including fixture Git operations,
source-tree CLI calls and adapter reads. Two nonzero exits were expected: a raw CSV
read through `pkb get`, and a search against a stale index. This count measures this
mechanical demonstration, not employee effort or comparison with a wiki workflow.

The [result and all three construction traces](../evals/groundray/results/2026-10-12-groundray-engine-fit-v1/result.json)
retain the setup iterations. Attempt 1 stopped before creation because the fictional
November 6 initialization date preceded insertion of an actually generated October
12 log entry in newest-first order. Attempt 2 stopped after construction because
the harness expected a link `status` key; the API returns `resolution`. Attempt 3
completed after those harness corrections. These are construction iterations, not
agent trials. Actual engine timestamps and the fictional business date are separate.

## Storage mapping and friction

| Wiki material | Current mapping | Friction / consequence |
| --- | --- | --- |
| Business explanations and company rules | Three `concept` drafts under `knowledge/wiki/`, with generated metadata and ordinary prose. | Current profile requires type-specific headings, descriptions, provenance and conditional confidence. Lite does not require those; the engine does. Agent editing needs an adapter rather than manual metadata maintenance. |
| TXT/CSV records | Original bytes under `knowledge/references/`. | Git distributes them and source links resolve; `pkb get` and native discovery do not expose arbitrary raw records. |
| Eight original Markdown records | Byte-identical `.md.txt` captures plus original-name mapping. | Every visible non-reserved `.md` is currently discovered as a concept. This explicit development filename convention avoids rewriting originals, but is not a whole-wiki import design or a released convention. Internal links in arbitrary imported documents are not rewritten or guaranteed navigable. |
| Wiki relationships | Existing wikilinks and relative Markdown source links. | Page links resolve after all targets exist. `pkb links` omits raw-resource links; inspect the body and `sources` metadata to follow those. |
| Approval and business scope | Supplied fictional rules explained in prose and linked to originals. | Draft metadata describes the synopsis lifecycle; it neither validates the supplied business approval nor cancels its genuine scoped meaning. No blanket “verified fact” label is added. |

The source-capture receipt records original path, stored path, byte count and hash.
It makes this fixture mapping inspectable, not source authenticity or origin time
independently proven. Earlier records, corrected records and other-company rows
remain available. The three pages are a selected synopsis, not a full wiki replica.

The development [saved-source reader](../evals/groundray/saved_source.py) accepts a
source ID declared by a retrieved item. It uses the engine's selected-brain health
checks, then reads that source's Git blob at the item's installed commit. It refuses
external URLs, undeclared source IDs, unsafe/hidden paths, dirty installations,
non-UTF-8 records and captures over 1 MiB. It emits the whole file; a fragment is
reported but not validated or used to select an excerpt. Five tests check exact
CRLF/Unicode/unknown-frontmatter bytes, provenance boundaries, dirty captures, size
limits and refusal to silently transcode. It is outside the shipped package and CLI.

## Reproduce

From a development checkout with `.[dev]` installed and a built `pkb-search`:

```bash
python -m evals.groundray.engine_fit \
  --output /tmp/groundray-g0-new \
  --native-command /absolute/path/to/pkb-search
```

Choose a new output path. The harness never overwrites a prior run and makes no
model or network calls. It creates the company Git repository, two isolated configs,
command trace, result and current bundle snapshot. New identities and timestamps
will differ from the published example. No global setup or skill install is needed.

Inspect the generated installation with the existing CLI:

```bash
pkb get wiki/lumen-margin.md --brain mosaic-studio \
  --config /tmp/groundray-g0-new/reader/config.yaml --json
python -m evals.groundray.saved_source wiki/lumen-margin.md ledger \
  --brain mosaic-studio --config /tmp/groundray-g0-new/reader/config.yaml
```

The helper is development-only; the second command is not a released `pkb` surface.
The example reader's source is the generated local company repository, not a remote.

## What comes next

G0 has a demonstrated development fit, with these integration tasks still open:

1. Provide explicit source capture and saved-source reading without requiring
   employees to seed files through Git or use a development Python helper. Decide
   how original Markdown captures coexist with concept discovery before selecting
   a production import/storage convention.
2. Let a remote-installed employee retain or attach a checked local authoring
   repository and propose a reviewed update. Current remote installation alone
   supplies no retained authoring path; authoring asks the user to clone/reinstall.
3. Exercise actual Lite creation/query/maintenance through the integrated interface,
   then run G1 with a shared test remote, review, publication and failure cases.

No schema relaxation, new production command, plugin or hosted service ships here.
The CLI versioning, local installation, search and explicit-sync mechanics work on
this fixture; ordinary agent usability, remote collaboration, cross-computer/platform
deployment and comparative benefit remain to be tested. See the
[product goal](groundray-product-goal.md) and [roadmap](roadmap.md).
