# acculynx-mcp-server

Local stdio MCP server exposing read-only AccuLynx v2 tools for Project
Jarvis's Sales sub-agent — see `Project Jarvis/AccuLynx.md` for the
connector's role, auth, rate-limit, and blocker notes.

## Tools

| Tool | Wraps |
|---|---|
| `list_jobs` | `GET /jobs` |
| `search_jobs` | `GET /jobs/search` |
| `get_job_milestones` | `GET /jobs/{id}/milestones` |
| `get_job_financials` | `GET /jobs/{id}/financials` |
| `get_job_invoices` | `GET /jobs/{id}/invoices` |
| `get_job_payments` | `GET /jobs/{id}/payments` |
| `get_job_payments_overview` | `GET /jobs/{id}/payments-overview` |
| `get_job_sales_owner` | `GET /jobs/{id}/sales-owner` |
| `get_job_representatives` | `GET /jobs/{id}/representatives` |
| `list_users` | `GET /users` |

All read-only (`readOnlyHint: true`). No write/mutation tools are exposed —
**this is a hard requirement, not a style choice**: AccuLynx API keys are
write-capable with no read-only scope (AccuLynx's own words: *"Your API Key
can be used by anyone to expose or manipulate your company data"*), so
read-only must be enforced entirely at this tool layer. See
`Project Jarvis/Security and Guardrails.md`.

Lead sources, trade/work types, and custom fields are documented as
available in AccuLynx's catalog but their exact endpoint paths aren't
confirmed anywhere in this vault yet (see `Project Jarvis/Caveats.md`) — not
implemented here to avoid guessing at unverified routes. Add them once the
real paths are confirmed against AccuLynx's OpenAPI/`llms.txt` index.

`list_jobs`'s filter param names (`milestone`, `sort`, `dateFrom`, `dateTo`)
are best-effort for the same reason — AccuLynx offers zero developer
support for its API. Use `extraParams` to pass raw query params through if
they don't match reality.

## Setup

1. In AccuLynx: **API settings** (company admin only) → generate a key.
   Each company location requires its own key.
2. `cp .env.example .env` and fill in `ACCULYNX_API_KEY`.
3. `npm install`
4. `npm run build`

## Run standalone (smoke test)

```bash
npm run inspect
```

Opens the MCP Inspector UI so you can call tools by hand before wiring it
into Claude Code.

## Connect to Claude Code

```bash
export $(cat .env | xargs)   # or source it however you prefer
claude mcp add acculynx -- node "$(pwd)/dist/index.js"
```

Claude Code launches it as a subprocess and passes your current shell env —
make sure `ACCULYNX_API_KEY` is exported in the shell you run `claude` from,
or set it in `claude mcp add` via `--env`.

## Upgrade path

This is a personal/local prototype (stdio transport, plaintext env-var
key). If this ever needs to be shared with others on the team, package it
as an **MCPB** bundle instead (bundles the Node runtime, no local Node
install required, and the OS keychain can hold the key instead of a
plaintext `.env`) — see the `build-mcpb` skill.
