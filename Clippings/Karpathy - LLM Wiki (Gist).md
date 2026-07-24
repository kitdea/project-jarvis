---
title: "LLM Wiki — Andrej Karpathy (gist)"
source: "https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f"
author: "karpathy"
published: 2026-04-04
created: 2026-07-12
description: "The canonical source document for the 'LLM Wiki' pattern — the three-layer (raw sources / wiki / schema) architecture this vault is built on. Referenced by name in CLAUDE.md and in Clippings/How I Built a Second Brain That Maintains Itself.md, but never itself ingested until now."
tags:
  - "clippings"
---
## LLM Wiki

A pattern for building personal knowledge bases using LLMs.

This is an idea file, designed to be copied to your own LLM Agent. Its goal communicates the high-level concept, with your agent building specifics collaboratively with you.

### The Core Idea

Most people's experience with LLMs and documents resembles RAG: upload files, retrieve relevant chunks at query time, generate answers. This works but lacks accumulation—the LLM rediscovers knowledge from scratch each time.

The different approach here: instead of just retrieving raw documents, the LLM **incrementally builds and maintains a persistent wiki**—a structured, interlinked markdown collection between you and raw sources. When adding new sources, the LLM doesn't merely index them. It reads, extracts key information, integrates into existing wiki, updates entity pages, revises summaries, notes contradictions, strengthens synthesis. Knowledge compiles once and stays current.

**Key difference: the wiki is a persistent, compounding artifact.** Cross-references exist already. Contradictions are flagged. Synthesis reflects everything consumed. The wiki grows richer with each source and question.

You source, explore, ask questions. The LLM maintains everything—summarizing, cross-referencing, filing, bookkeeping. In practice: LLM agent on one side, Obsidian on the other. The LLM edits based on conversation; you browse results in real time, follow links, check graphs, read updated pages. Obsidian is the IDE; LLM is the programmer; wiki is the codebase.

### Applicable Contexts

- **Personal**: tracking goals, health, psychology, self-improvement through journal entries, articles, podcast notes
- **Research**: deep topic exploration across weeks/months, building comprehensive wiki with evolving thesis
- **Reading**: filing chapters, building character/theme/plot pages, creating companion wikis
- **Business/team**: internal wiki maintained by LLMs, fed by Slack, transcripts, documents, customer calls
- **Competitive analysis, due diligence, trip planning, course notes, hobby deep-dives**

### Architecture

Three layers:

**Raw sources**—curated collection of immutable documents. Articles, papers, images, data. LLM reads but never modifies.

**The wiki**—directory of LLM-generated markdown. Summaries, entity pages, concept pages, comparisons, overviews, synthesis. LLM owns this entirely. Creates, updates, maintains cross-references, keeps consistency.

**The schema**—document (e.g., CLAUDE.md) telling the LLM how wiki is structured, conventions, workflows for ingesting sources, answering questions, maintaining wiki. Key configuration file making LLM a disciplined maintainer, not generic chatbot. Co-evolves with user over time.

### Operations

**Ingest**: Drop new source, tell LLM to process. Example flow: reads source, discusses takeaways, writes summary page, updates index, updates relevant entity/concept pages, appends log entry. Single source touches 10-15 pages. Can ingest one-at-a-time with guidance or batch with less supervision.

**Query**: Ask questions against wiki. LLM searches relevant pages, synthesizes answer with citations. Answers take different forms—markdown page, comparison table, slide deck, chart, canvas. **Important: good answers file back into wiki as new pages.** Comparisons, analyses, connections stay valuable and compound knowledge.

**Lint**: Periodically health-check the wiki. Look for contradictions, stale claims superseded by newer sources, orphan pages lacking inbound links, important concepts missing dedicated pages, missing cross-references, data gaps. LLM suggests new questions and sources to investigate.

### Indexing and Logging

Two special files help navigate growing wikis:

**index.md** is content-oriented. Catalog of everything—each page listed with link, one-line summary, optional metadata. Organized by category. LLM updates on every ingest. When answering queries, LLM reads index first to find relevant pages, then drills in. Works well at moderate scale (~100 sources, hundreds of pages) without embedding infrastructure.

**log.md** is chronological. Append-only record of what happened and when—ingests, queries, lint passes. If entries start with consistent prefix (e.g., `## [2026-04-02] ingest | Article Title`), becomes parseable with simple tools. Gives timeline of wiki evolution, helps LLM understand recent activity.

### Optional: CLI Tools

At scale, small tools help LLM operate efficiently. Search engine over wiki pages is most obvious—qmd provides local search with hybrid BM25/vector search and LLM re-ranking, all on-device. Has both CLI (LLM shells out) and MCP server (LLM uses natively). Build simpler search scripts yourself as needs arise.

### Tips and Tricks

- **Obsidian Web Clipper**: browser extension converting web articles to markdown, useful for quickly adding sources
- **Download images locally**: Settings → Files and links → set attachment folder path. Then Settings → Hotkeys bind "Download attachments for current file" hotkey. After clipping, hit hotkey; images download locally. Lets LLM view and reference images directly instead of relying on URLs
- **Obsidian graph view**: best way seeing wiki shape—what connects, which pages are hubs, which are orphans
- **Marp**: markdown-based slide deck format, Obsidian has plugin, useful for presentations from wiki
- **Dataview**: Obsidian plugin running queries over page frontmatter. If LLM adds YAML frontmatter, Dataview generates dynamic tables and lists
- **Git repo**: wiki is just markdown files in git, getting version history, branching, collaboration free

### Why This Works

Maintaining knowledge bases is tedious bookkeeping, not reading or thinking. Updating cross-references, keeping summaries current, noting contradictions, maintaining consistency across dozens of pages. Humans abandon wikis because maintenance burden grows faster than value. LLMs don't get bored, don't forget cross-references, touch 15 files in one pass. Wiki stays maintained because maintenance cost is near zero.

Human job: curate sources, direct analysis, ask good questions, think about meaning. LLM job: everything else.

Related in spirit to Vannevar Bush's Memex (1945)—personal, curated knowledge store with associative trails between documents. Closer to this pattern than web became: private, actively curated, connections between documents as valuable as documents themselves. Bush couldn't solve maintenance. LLM handles that.

### Note

This document is intentionally abstract. Describes idea, not specific implementation. Exact directory structure, schema conventions, page formats, tooling all depend on domain, preferences, LLM choice. Everything mentioned is optional and modular—pick what's useful, ignore what isn't. Right way using this: share with LLM agent, work together instantiating a version fitting your needs. Document's only job communicates the pattern.

---
⬅ Referenced by [[CLAUDE.md]] · [[Karpathy - LLM Knowledge Bases (X thread)]] · [[How I Built a Second Brain That Maintains Itself]]
