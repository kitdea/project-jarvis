# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is an **Obsidian vault**, not a software codebase — there is no build, test, or package-manager tooling here. ("Lint" below means a wiki health-check, not code linting.) It is a personal knowledge base of linked Markdown notes, currently centered on **Project Jarvis**, a proposed multi-agent AI architecture for Shumaker Roofing Co. (Marketing, Sales & Reporting). Obsidian config lives in `.obsidian/` and should generally be left alone unless the user asks for a settings change.

This vault is built as a **self-maintaining wiki** (Karpathy's "LLM Wiki" pattern — see `Clippings/Karpathy - LLM Wiki (Gist).md`, the canonical source; also `Clippings/Karpathy - LLM Knowledge Bases (X thread).md`), not a RAG store. New sources get read once and integrated into the wiki pages that already exist, rather than chunked and retrieved on demand. See "Second-brain / wiki maintenance pattern" below.

## Working with notes here

- **Source of truth:** `Project Jarvis/Project Jarvis - Agentic OS.md` is the hub note for the Jarvis architecture. Every other note in `Project Jarvis/` links back to it and to its sibling notes — preserve this hub-and-spoke linking pattern when adding or editing notes.
- **Wikilinks, not relative paths:** cross-references use Obsidian `[[Note Name]]` / `[[Note Name|display text]]` syntax. Obsidian resolves these vault-wide regardless of folder, so notes don't need relative paths — keep using bare `[[Note Name]]` links when adding new notes or moving existing ones.
- **Frontmatter convention:** each note opens with YAML frontmatter (`title`, `type`, `source`) followed by a level-1 heading restating the title, a "⬅ Back to [[Project Jarvis - Agentic OS]]" line near the top, and the same back-link repeated at the bottom. Match this shape for new notes in the set.
- **One concept per note:** the existing structure splits the source PDF by layer (`Layer 1` … `Layer 6`) and by individual connector (`AccuLynx.md`, `Google Ads API.md`, `GoHighLevel v2.md`, `CallRail v3.md`, `PostgreSQL Reporting.md`), plus standalone notes for cross-cutting concerns (`Security and Guardrails.md`, `Implementation Roadmap.md`, `Recommendations.md`, `Caveats.md`, `Routing Example.md`). When adding new material derived from a source document, prefer creating a new linked note over expanding an existing one into an unrelated topic.
- **Cite sources:** notes carry a `source:` frontmatter field and an inline citation (e.g., "Project Jarvis PDF, pp.3-4") pointing at the original document and page range. Carry this convention forward for any new source material.
- **No build step:** changes are just Markdown file edits. There's nothing to compile or run — verification is "does this note read correctly and do its links resolve in Obsidian."

## Second-brain / wiki maintenance pattern

Three layers (Karpathy's model — see the three Karpathy notes in `Clippings/` for the full writeup, primarily `Karpathy - LLM Wiki (Gist).md`):

1. **Raw Sources** (`Clippings/`) — immutable originals: PDFs, web clippings, saved threads. **Read-only.** Never edit a file in this folder; only read from it. Obsidian's Web Clipper drops new items here automatically.
2. **Wiki** (`Project Jarvis/`, and any future project folders) — the AI-maintained layer: hub, layer notes, connector notes, summaries, trackers, logs. This is what changes.
3. **Schema** — this file.

### Ingestion workflow
**Trigger:** user says "ingest [file]" / "analyze [source]", or a new file appears in `Clippings/`.

1. Read the full source.
2. Identify every **existing** wiki page it's relevant to — don't default to "just add a new note."
3. Update those existing pages first. Only create a new page for a genuinely new concept not already covered (per the "one concept per note" rule above).
4. If the new source contradicts an existing wiki claim, **surface it explicitly** — don't silently overwrite. Ask before resolving a real contradiction; a citation/date fix can just be fixed.
5. Log the event in `Project Jarvis/Ingestion Log.md` — source, action taken, result.
6. Keep the sourcing convention: cite the file and page/section for anything pulled from it.

### Lint workflow
**Trigger:** user says "lint the wiki."

Health-check the wiki folder(s) for:
- Broken wikilinks (`[[Target]]` where `Target.md` doesn't exist)
- Orphan pages (not linked from the hub or any index)
- Frontmatter missing `title` / `type` / `source`
- Citations that don't match the actual page/section in the raw source
- Claims in different pages that now contradict each other
- Stale claims a newer ingested source has superseded

Report findings ranked by severity. Fix with the user's sign-off — don't mass-rewrite pages unprompted.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
