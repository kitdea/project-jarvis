# Project Jarvis

An Obsidian vault plus a working local Jarvis app: a multi-agent AI system for Shumaker Roofing Co.'s Marketing, Sales & Reporting, built on the Claude Agent SDK.

## What's here

- **`Project Jarvis/`** — the wiki (hub-and-spoke Markdown notes: architecture layers, connectors, roadmap, trackers). Start at `Project Jarvis/Project Jarvis - Agentic OS.md`.
- **`Clippings/`** — raw, read-only source material (PDFs, web clippings) that the wiki is built from.
- **`server.py` + `viewer/`** — the live Jarvis app: serves `viewer/` on port 4700, answers chat at `POST /chat`, and captures notes at `/remember`. This is the current, working entry point.
- **`mcp-servers/`** — MCP servers wrapping the external APIs Jarvis uses (AccuLynx, CallRail, GoHighLevel, Semrush, Supermetrics).
- **`jarvis-dashboard/`** — retired prototype (2026-08-13). Superseded by `server.py` + `viewer/`; kept for reference only. See its own README.
- **`graphify-out/`** — generated knowledge graph of this repo (see `CLAUDE.md`).

## Running Jarvis

```
python3 server.py
```

Then open `http://localhost:4700`.

## Working with the wiki

See `CLAUDE.md` for the full conventions (wikilink style, frontmatter, ingestion/lint workflows). In short: this vault is a self-maintaining wiki, not a RAG store — new sources get read once and merged into the existing wiki pages rather than chunked for retrieval.
