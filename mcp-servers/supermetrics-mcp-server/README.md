# supermetrics-mcp-server

Local stdio MCP server exposing a read-only Supermetrics API v2 query tool
for Project Jarvis's Marketing sub-agent — pulls data from whatever sources
(Google Ads, etc.) are configured on the connected Supermetrics account.

## Tools

| Tool | Wraps | Confidence |
|---|---|---|
| `query` | `POST /enterprise/v2/query/data` | Base URL, auth, and core params (`ds_id`, `ds_accounts`, `start_date`, `end_date`, `fields`, `filter`, `order_rows`, `max_rows`) confirmed against Supermetrics' docs. Not yet live-tested from this codebase. |

Read-only (`readOnlyHint: true`). No write/mutation tools are exposed.

**Important gap vs. the claude.ai Supermetrics connector:** that connector
exposes `data_source_discovery`, `accounts_discovery`, and `field_discovery`
tools so an agent can find valid `dsId`/`dsAccounts`/field names on the fly.
This server does **not** implement equivalents (their exact REST shape
wasn't confirmed while building this) — the caller must already know those
values. For Shumaker Roofing's Google Ads account, `dsId` is `GAWA` and the
account is `8531416360` (already used via the claude.ai connector — see
`Project Jarvis/Google Ads API.md` for confirmed field names from that live
pull). Set those as defaults in `.env` so most calls don't need to pass them.

## Setup

1. In Supermetrics: **API Keys** → create one
   ([docs](https://docs.supermetrics.com/apidocs/create-api-key-1)).
2. `cp .env.example .env` and fill in `SUPERMETRICS_API_KEY`. The example
   file pre-fills `SUPERMETRICS_DEFAULT_DS_ID`/`_DS_ACCOUNTS` for Shumaker's
   Google Ads account — adjust or clear if that's wrong for your key.
3. `npm install`
4. `npm run build`

## Run standalone (smoke test)

```bash
npm run inspect
```

This is the first real test of this server against the live API — confirm
the response shape here before wiring it into the dashboard, and fix
`supermetrics-client.ts` if Supermetrics' actual response differs from what
the docs implied.

## Connect to Claude Code

```bash
export $(cat .env | xargs)
claude mcp add supermetrics -- node "$(pwd)/dist/index.js"
```

## Upgrade path

Personal/local prototype (stdio transport, plaintext env-var key). If this
needs to be shared with others on the team, package as an **MCPB** bundle
instead — see the `build-mcpb` skill.
