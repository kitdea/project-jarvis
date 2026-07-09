# ghl-mcp-server

Local stdio MCP server exposing read-only GoHighLevel v2 tools for Project
Jarvis's Marketing sub-agent — see `Project Jarvis/GoHighLevel v2.md` for the
connector's role, auth, and rate-limit notes.

## Tools

| Tool | Wraps |
|---|---|
| `list_contacts` | `GET /contacts/` |
| `get_contact` | `GET /contacts/{contactId}` |
| `list_opportunities` | `GET /opportunities/search` |
| `get_pipeline_stages` | `GET /opportunities/pipelines` |
| `list_conversations` | `GET /conversations/search` |
| `get_conversation_messages` | `GET /conversations/{conversationId}/messages` |

All read-only (`readOnlyHint: true`). No write/mutation tools are exposed.

## Setup

1. In GHL: **Settings → Private Integrations** → create a token scoped to
   `contacts.readonly`, `opportunities.readonly`, `conversations.readonly`.
2. `cp .env.example .env` and fill in `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID`.
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
claude mcp add ghl -- node "$(pwd)/dist/index.js"
```

Claude Code launches it as a subprocess and passes your current shell env —
make sure `GHL_PRIVATE_TOKEN`/`GHL_LOCATION_ID` are exported in the shell you
run `claude` from, or set them in `claude mcp add` via `--env`.

## Upgrade path

This is a personal/local prototype (stdio transport, plaintext env-var
token). If this ever needs to be shared with others on the team, package it
as an **MCPB** bundle instead (bundles the Node runtime, no local Node
install required, and the OS keychain can hold the token instead of a
plaintext `.env`) — see the `build-mcpb` skill.
