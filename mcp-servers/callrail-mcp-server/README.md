# callrail-mcp-server

Local stdio MCP server exposing read-only CallRail v3 tools for Project
Jarvis's Marketing and Sales sub-agents — see `Project Jarvis/CallRail
v3.md` for the connector's role, auth, rate-limit, and pricing-tier notes.

## Tools

| Tool | Wraps |
|---|---|
| `list_accounts` | `GET /a.json` |
| `list_calls` | `GET /a/{account_id}/calls.json` |
| `get_call` | `GET /a/{account_id}/calls/{id}.json` |
| `list_tags` | `GET /a/{account_id}/tags.json` |
| `list_companies` | `GET /a/{account_id}/companies.json` |
| `list_form_submissions` | `GET /a/{account_id}/form_submissions.json` |

All read-only (`readOnlyHint: true`). No write/mutation tools are exposed.

`list_accounts` and `list_calls` are confirmed working against the live
Shumaker Roofing account (see `Project Jarvis/CallRail v3.md` "Live
account"/"Live audit" sections and `project-jarvis-skills/scripts/`). The
other four tools wrap endpoints from CallRail's public v3 API reference
that aren't yet live-tested from this codebase — treat their exact response
shape as unconfirmed until exercised once via `npm run inspect`.

**Important caveat baked into this server's `instructions`:** `lead_status`
and `value` are documented as CallRail's primary lead-qualification fields
but are 0% populated in the live account — `tags` and Premium Conversation
Intelligence's `lead_score` are what's actually in use. Most qualification
fields (including all of the above) are omitted from the default response
and must be requested via each tool's `fields` param.

## Setup

1. In CallRail: **Settings → API Keys** → generate a key.
2. `cp .env.example .env` and fill in `CALLRAIL_API_KEY`. Optionally set
   `CALLRAIL_ACCOUNT_ID` (Shumaker Roofing's is
   `ACCfeaac83d5b6747a19296411223ea9240` — confirmed in
   `Project Jarvis/CallRail v3.md`) so tools don't need it passed each call.
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
claude mcp add callrail -- node "$(pwd)/dist/index.js"
```

Claude Code launches it as a subprocess and passes your current shell env —
make sure `CALLRAIL_API_KEY` (and `CALLRAIL_ACCOUNT_ID`, if set) is exported
in the shell you run `claude` from, or set it in `claude mcp add` via
`--env`.

## Upgrade path

This is a personal/local prototype (stdio transport, plaintext env-var
key). If this ever needs to be shared with others on the team, package it
as an **MCPB** bundle instead (bundles the Node runtime, no local Node
install required, and the OS keychain can hold the key instead of a
plaintext `.env`) — see the `build-mcpb` skill.
