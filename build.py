#!/usr/bin/env python3
"""Scan a folder of Markdown notes and emit viewer/graph-data.js.

Standard library only. Produces:

    const GRAPH = {nodes: [...], links: [...]};

Each node carries a numeric `id` equal to its index in the nodes array, so
downstream features can look a node up by position via GRAPH.nodes[id].
"""

import argparse
import json
import os
import re
import sys

# Directories never worth walking into. `node_modules` shows up nested several
# levels deep in this vault, so it is matched at any depth, not just the root.
SKIP_DIRS = {"node_modules", "graphify-out", "__pycache__", "venv", ".venv"}

EXCERPT_CHARS = 700

WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)")
FRONTMATTER_RE = re.compile(r"\A---\n.*?\n---\n", re.DOTALL)
CODE_FENCE_RE = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE_RE = re.compile(r"`[^`\n]*`")
IMAGE_RE = re.compile(r"!\[[^\]]*\]\([^)]*\)")
MD_LINK_RE = re.compile(r"\[([^\]]*)\]\([^)]*\)")
HEADING_RE = re.compile(r"^#{1,6}\s*", re.MULTILINE)
WS_RE = re.compile(r"\s+")


def should_skip(dirname):
    return dirname in SKIP_DIRS or dirname.startswith(".")


def find_notes(root):
    """Walk `root`, yielding .md paths and pruning noise directories in place."""
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if not should_skip(d))
        for name in sorted(filenames):
            if name.lower().endswith(".md"):
                found.append(os.path.join(dirpath, name))
    return found


def read_text(path):
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        return handle.read()


def make_excerpt(raw):
    """Strip Markdown scaffolding down to readable prose for the side panel."""
    text = FRONTMATTER_RE.sub("", raw)
    text = CODE_FENCE_RE.sub(" ", text)
    text = IMAGE_RE.sub(" ", text)
    text = MD_LINK_RE.sub(r"\1", text)
    text = INLINE_CODE_RE.sub(" ", text)
    text = text.replace("[[", "").replace("]]", "")
    text = HEADING_RE.sub("", text)
    text = re.sub(r"[*_>`]", "", text)
    text = WS_RE.sub(" ", text).strip()
    if len(text) <= EXCERPT_CHARS:
        return text
    clipped = text[:EXCERPT_CHARS]
    # Prefer to end on a word boundary rather than mid-token.
    space = clipped.rfind(" ")
    if space > EXCERPT_CHARS * 0.6:
        clipped = clipped[:space]
    return clipped.rstrip() + "…"


def group_for(path, root):
    rel = os.path.relpath(path, root)
    parent = os.path.dirname(rel)
    if not parent or parent == ".":
        return "root"
    # Top-most folder is the group, so nested notes still cluster sensibly.
    return parent.split(os.sep)[0]


def build_nodes(paths, root):
    nodes = []
    for index, path in enumerate(paths):
        raw = read_text(path)
        label = os.path.splitext(os.path.basename(path))[0]
        nodes.append(
            {
                "id": index,
                "label": label,
                "group": group_for(path, root),
                "path": os.path.relpath(path, root),
                "excerpt": make_excerpt(raw),
                "_raw": raw,
                "_wikilinks": {m.strip().lower() for m in WIKILINK_RE.findall(raw)},
            }
        )
    return nodes


def build_links(nodes):
    """Link notes that reference each other by title or share a wikilink target.

    Mention detection uses a word-boundary search on the lowercased body so a
    title like "Caveats" does not match inside "Caveatsomething".
    """
    by_title = {}
    for node in nodes:
        by_title.setdefault(node["label"].lower(), node["id"])

    bodies = [node["_raw"].lower() for node in nodes]
    # Titles under 4 chars produce far too many incidental hits to be useful.
    patterns = {
        node["id"]: re.compile(r"\b" + re.escape(node["label"].lower()) + r"\b")
        for node in nodes
        if len(node["label"]) >= 4
    }

    seen = set()
    links = []

    def add(a, b, reason):
        if a == b:
            return
        key = (min(a, b), max(a, b))
        if key in seen:
            return
        seen.add(key)
        links.append({"source": key[0], "target": key[1], "reason": reason})

    # 1. Explicit wikilinks, and any title mentioned in another note's body.
    for node in nodes:
        for target in node["_wikilinks"]:
            if target in by_title:
                add(node["id"], by_title[target], "wikilink")
        for other_id, pattern in patterns.items():
            if other_id != node["id"] and pattern.search(bodies[node["id"]]):
                add(node["id"], other_id, "mention")

    # 2. Two notes pointing at the same wikilink target are related.
    shared = {}
    for node in nodes:
        for target in node["_wikilinks"]:
            shared.setdefault(target, []).append(node["id"])
    for ids in shared.values():
        if 2 <= len(ids) <= 12:
            for i in range(len(ids)):
                for j in range(i + 1, len(ids)):
                    add(ids[i], ids[j], "shared-link")

    return links


def write_graph(nodes, links, out_path):
    public = [
        {k: v for k, v in node.items() if not k.startswith("_")} for node in nodes
    ]
    payload = {"nodes": public, "links": links}
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as handle:
        handle.write("// Generated by build.py - do not edit by hand.\n")
        handle.write("const GRAPH = ")
        json.dump(payload, handle, ensure_ascii=False, indent=1)
        handle.write(";\n")
    return public


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("notes", nargs="?", default=here, help="folder of .md notes")
    parser.add_argument(
        "-o",
        "--out",
        default=os.path.join(here, "viewer", "graph-data.js"),
        help="output path for graph-data.js",
    )
    args = parser.parse_args()

    root = os.path.abspath(args.notes)
    if not os.path.isdir(root):
        sys.exit("Not a directory: %s" % root)

    paths = find_notes(root)
    if not paths:
        sys.exit("No .md files found under %s" % root)

    nodes = build_nodes(paths, root)
    links = build_links(nodes)
    public = write_graph(nodes, links, os.path.abspath(args.out))

    groups = {}
    for node in public:
        groups[node["group"]] = groups.get(node["group"], 0) + 1

    print("Scanned %s" % root)
    print("  %d notes, %d links -> %s" % (len(public), len(links), args.out))
    for name in sorted(groups, key=lambda g: (-groups[g], g)):
        print("    %-24s %d" % (name, groups[name]))


if __name__ == "__main__":
    main()
