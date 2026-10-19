"""Development-only reading of an item's declared local source at its saved commit.

This bridges the raw-record gap for G0. It is not a released CLI command,
whole-wiki importer, source-authenticity check or arbitrary repository browser.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import subprocess
from pathlib import PurePosixPath
from urllib.parse import unquote, urlsplit

from groundray.brains import BrainError, load_catalog
from groundray.search import SearchError, get_knowledge
from groundray.settings import Settings, load_settings

MAX_SOURCE_BYTES = 1024 * 1024


def read_saved_source(
    settings: Settings, item: str, source_id: str, *, slug: str, as_of: str | None = None
) -> dict:
    """Read a declared local source through the selected brain's immutable Git pin."""
    context = get_knowledge(settings, item, slug, as_of=as_of)
    metadata = context.get("item", {}).get("metadata", {})
    sources = [s for s in metadata.get("sources", []) if s.get("id") == source_id]
    if len(sources) != 1:
        raise ValueError("Select exactly one source ID declared by the retrieved item.")
    resource = sources[0]["resource"]
    parsed = urlsplit(resource)
    if parsed.scheme or parsed.netloc or parsed.query:
        raise ValueError("This development reader accepts local source captures only.")
    value = unquote(parsed.path)
    if not value or "\\" in value or "\x00" in value or PurePosixPath(value).is_absolute():
        raise ValueError("Source must be a relative local resource.")
    path = posixpath.normpath(posixpath.join(posixpath.dirname(context["item"]["path"]), value))
    if path == ".." or path.startswith("../") or any(p.startswith(".") for p in path.split("/")):
        raise ValueError("Source must stay inside the visible knowledge bundle.")
    brain = load_catalog(settings).get(slug)
    if brain.commit != context["brain"]["commit"]:
        raise ValueError(
            "Selected brain changed while preparing the source read; retry explicitly."
        )
    checkout = brain.checkout_path(settings)
    bundle = checkout / "knowledge"
    candidate = bundle / path
    if (
        not candidate.resolve().is_relative_to(bundle.resolve())
        or not candidate.is_file()
        or any(
            bundle.joinpath(*PurePosixPath(path).parts[:i]).is_symlink()
            for i in range(len(PurePosixPath(path).parts) + 1)
        )
    ):
        raise ValueError("Source is missing or contains an unsafe filesystem path.")
    object_name = f"{brain.commit}:knowledge/{path}"
    command = ["git", "--no-replace-objects", "-C", str(checkout), "cat-file"]
    size = subprocess.run(
        command + ["-s", object_name], check=True, capture_output=True, timeout=30
    )
    if int(size.stdout) > MAX_SOURCE_BYTES:
        raise ValueError("Source exceeds the development reader's 1 MiB limit.")
    saved = subprocess.run(
        command + ["blob", object_name], check=True, capture_output=True, timeout=30
    )
    material = saved.stdout
    return {
        "source": {
            "id": source_id,
            "resource": resource,
            "path": path,
            "bytes": len(material),
            "sha256": hashlib.sha256(material).hexdigest(),
            "content": material.decode("utf-8"),
        },
        "citation": {
            "brain_id": brain.id,
            "brain_slug": slug,
            "commit": brain.commit,
            "path": path,
        },
        "context_citation": context["citation"],
        "fragment": parsed.fragment or None,
        "scope": "development-only; complete source file; fragment not validated",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("item")
    parser.add_argument("source_id")
    parser.add_argument("--brain", required=True)
    parser.add_argument("--config", required=True)
    parser.add_argument("--as-of")
    args = parser.parse_args()
    try:
        result = read_saved_source(
            load_settings(args.config), args.item, args.source_id, slug=args.brain, as_of=args.as_of
        )
    except (BrainError, SearchError, ValueError, OSError, subprocess.SubprocessError) as error:
        parser.exit(1, f"{error}\n")
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
