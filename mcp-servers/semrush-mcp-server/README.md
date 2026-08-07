# semrush-mcp-server

Local stdio MCP server exposing read-only Semrush Analytics API tools for
Project Jarvis's Marketing sub-agent — SEO/competitive research (domain
overview, organic & paid keyword data).

## Tools

| Tool | Wraps | Confidence |
|---|---|---|
| `domain_overview` | `GET /?type=domain_ranks` | Confirmed shape (verified against Semrush's documented example) |
| `run_report` | `GET /?type={type}` (generic) | Passthrough — caller supplies `exportColumns`; not independently verified per report type |

Both read-only (`readOnlyHint: true`). No write/mutation tools are exposed —
Semrush's classic API is read-only by nature (it serves reports, it doesn't
accept writes).

**Important caveat:** only `domain_overview` has a request/response shape
confirmed against Semrush's own documentation as of this server's build.
`run_report` is a deliberate escape hatch for other report types
(`domain_organic`, `domain_adwords`, `phrase_this`, `phrase_related`,
`backlinks_overview`, etc.) rather than a set of hardcoded wrappers, because
the exact column-code scheme for those types wasn't independently verified
— getting that wrong silently would be worse than requiring the caller to
supply `exportColumns` explicitly. Once live-tested via `npm run inspect`,
promote confirmed report types to dedicated tools here (following
`domain_overview`'s pattern) and update this table.

Each API call consumes Semrush "API units" from the account's balance —
prefer targeted calls over broad exploratory ones.

## Setup

1. In Semrush: profile → **API keys** → generate a key
   ([docs](https://developer.semrush.com/api/get-started/authorization/)).
2. `cp .env.example .env` and fill in `SEMRUSH_API_KEY`. Optionally set
   `SEMRUSH_DEFAULT_DATABASE` (defaults to `us`).
3. `npm install`
4. `npm run build`

## Run standalone (smoke test)

```bash
npm run inspect
```

## Connect to Claude Code

```bash
export $(cat .env | xargs)
claude mcp add semrush -- node "$(pwd)/dist/index.js"
```

## Upgrade path

Personal/local prototype (stdio transport, plaintext env-var key). If this
needs to be shared with others on the team, package as an **MCPB** bundle
instead — see the `build-mcpb` skill.
