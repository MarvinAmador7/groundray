"""Record local presentation/source reads for opt-in simulated owner exercises.

This is development instrumentation, not human-effort telemetry or OS isolation.
Accept Markdown source-link targets, including a sources/ prefix and fragments.
Fragments select a file; the whole file is emitted, not a heading-only excerpt.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import time
from pathlib import Path
from urllib.parse import unquote


def read_material(root: Path, kind: str, target: str | None = None) -> str:
    root = root.resolve()
    log = root / "reads.jsonl"
    events = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
    if kind == "view" and target is None:
        path, name = root / "view.md", "view.md"
    elif kind == "source" and target:
        value = unquote(target.split("#", 1)[0])
        if value.startswith("sources/"):
            value = value.removeprefix("sources/")
        base = (root / "sources").resolve()
        candidate = Path(value)
        if candidate.is_absolute():
            raise ValueError("Source target must be relative to the saved folder")
        path = (base / candidate).resolve()
        if not path.is_relative_to(base) or not path.is_file():
            raise ValueError("Source must be an existing file inside the source folder")
        name = path.relative_to(base).as_posix()
        seen = {event["path"] for event in events if event["kind"] == "source"}
        if name not in seen and len(seen) >= 3:
            raise ValueError("Three distinct source files already inspected")
    else:
        raise ValueError("Use view, or source with a local link target")
    material = path.read_bytes()
    text = material.decode("utf-8")
    event = {
        "kind": kind,
        "path": name,
        "bytes": len(material),
        "sha256": hashlib.sha256(material).hexdigest(),
        "at_ns": time.time_ns(),
    }
    with log.open("a") as destination:
        destination.write(json.dumps(event) + "\n")
    return text


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("kind", choices=("view", "source"))
    parser.add_argument("target", nargs="?")
    args = parser.parse_args()
    try:
        text = read_material(Path.cwd(), args.kind, args.target)
    except (ValueError, OSError) as error:
        parser.exit(1, f"{error}\n")
    print(text, end="")


if __name__ == "__main__":
    main()
