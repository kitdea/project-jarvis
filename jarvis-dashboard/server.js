const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const { getGraph } = require('./graph');
const { runBrief, listBriefs, deleteBrief, clearBriefs, scheduleBriefs } = require('./briefs');

const VAULT_ROOT = path.resolve(__dirname, '..');
const GHL_DIR = path.join(VAULT_ROOT, 'mcp-servers', 'ghl-mcp-server');
const CALLRAIL_DIR = path.join(VAULT_ROOT, 'mcp-servers', 'callrail-mcp-server');
const SEMRUSH_DIR = path.join(VAULT_ROOT, 'mcp-servers', 'semrush-mcp-server');
const SUPERMETRICS_DIR = path.join(VAULT_ROOT, 'mcp-servers', 'supermetrics-mcp-server');
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, 'system-prompt.md'), 'utf8');
const PORT = process.env.JARVIS_PORT || 8720;

// The Claude Agent SDK ships as an ESM-only package; load it lazily via
// dynamic import() from this CommonJS server.
let queryPromise;
function getQuery() {
  if (!queryPromise) {
    queryPromise = import('@anthropic-ai/claude-agent-sdk').then((mod) => mod.query);
  }
  return queryPromise;
}

function loadEnvFile(envPath) {
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const ghlEnv = loadEnvFile(path.join(GHL_DIR, '.env'));
const callrailEnv = loadEnvFile(path.join(CALLRAIL_DIR, '.env'));
const semrushEnv = loadEnvFile(path.join(SEMRUSH_DIR, '.env'));
const supermetricsEnv = loadEnvFile(path.join(SUPERMETRICS_DIR, '.env'));

// Same scope as voice-app: only GHL and CallRail are registered as MCP
// servers. AccuLynx and any Postgres/reporting/infra server are never wired
// in here.
const MCP_SERVERS = {
  ghl: {
    type: 'stdio',
    command: 'node',
    args: [path.join(GHL_DIR, 'dist', 'index.js')],
    env: ghlEnv,
  },
  callrail: {
    type: 'stdio',
    command: 'node',
    args: [path.join(CALLRAIL_DIR, 'dist', 'index.js')],
    env: callrailEnv,
  },
};

// Step 3: Semrush and Supermetrics, registered only once real API keys are
// present in their own .env files (mcp-servers/semrush-mcp-server/.env,
// mcp-servers/supermetrics-mcp-server/.env — copy from .env.example in each
// directory). Conditional on purpose: both servers exit(1) immediately if
// their API key env var is unset, so registering them unconditionally would
// spawn a subprocess that fails on every query until keys are added. Until
// then the dashboard behaves exactly as before (GHL + CallRail only); drop
// in the keys and restart the server to pick them up, no code change needed.
if (semrushEnv.SEMRUSH_API_KEY) {
  MCP_SERVERS.semrush = {
    type: 'stdio',
    command: 'node',
    args: [path.join(SEMRUSH_DIR, 'dist', 'index.js')],
    env: semrushEnv,
  };
}
if (supermetricsEnv.SUPERMETRICS_API_KEY) {
  MCP_SERVERS.supermetrics = {
    type: 'stdio',
    command: 'node',
    args: [path.join(SUPERMETRICS_DIR, 'dist', 'index.js')],
    env: supermetricsEnv,
  };
}

// Step 2 of the dashboard rebuild: an explicit allow-list for the Agent
// SDK's *built-in* tools (Bash, Read, Write, Edit, Grep, Glob, Task,
// NotebookEdit, etc.). Without this, the SDK defaults to the full Claude
// Code built-in toolset — meaning Bash/Read/Write could already reach
// anything on this machine (including AccuLynx source, .env secrets, or the
// rest of the vault) regardless of what the MCP layer restricts. `tools`
// sets the *base set* of available built-ins, so anything left off this
// list is simply unavailable to the model, not just unapproved.
//
// We only need WebSearch/WebFetch here (for live marketing-trend lookups) —
// everything else the assistant needs comes from the GHL/CallRail (and
// later Semrush/Supermetrics) MCP servers above, which are unaffected by
// this list.
const BUILTIN_TOOLS = ['WebSearch', 'WebFetch'];

// Belt-and-suspenders on top of `tools`: explicitly block the highest-risk
// built-ins by name too, so a future edit that changes BUILTIN_TOOLS to a
// preset (e.g. `{ type: 'preset', preset: 'claude_code' }`) can't silently
// reopen Bash/Write/Edit without also touching this list.
const DISALLOWED_TOOLS = ['Bash', 'Write', 'Edit', 'NotebookEdit'];

// CRITICAL: `mcpServers` above is NOT the only source of MCP tools. The
// Agent SDK's underlying CLI subprocess also merges in MCP servers
// registered at the project level (`claude mcp add`, stored in
// ~/.claude.json under this vault's project path) for whatever `cwd` is
// passed to query(). This project has `acculynx` registered there (from
// earlier Phase 0 smoke testing), so WITHOUT this flag, AccuLynx's
// write-capable API tools are reachable from this app despite never being
// listed in MCP_SERVERS — verified live: the tool list included
// mcp__acculynx__* entries until this was added. `strictMcpConfig: true`
// restricts MCP tools to *only* what's explicitly passed via `mcpServers`
// in this file, ignoring project .mcp.json / ~/.claude.json / user
// settings entirely. This is what actually makes "AccuLynx is structurally
// unreachable" true — the mcpServers allow-list alone did not.
const STRICT_MCP_CONFIG = true;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
// Served locally (not a CDN) so the dashboard keeps working with no
// internet access beyond what GHL/CallRail/Semrush/Supermetrics/WebSearch
// themselves need.
app.use('/vendor', express.static(path.join(__dirname, 'node_modules', 'force-graph', 'dist')));

// Step 4: knowledge graph panel. Builds nodes/links directly from GHL +
// CallRail REST data (not through the LLM — see graph.js for why) and
// caches for a few minutes. ?refresh=1 forces a rebuild.
app.get('/api/graph', async (req, res) => {
  try {
    const data = await getGraph({
      ghlEnv,
      callrailEnv,
      forceRefresh: req.query.refresh === '1',
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Step 6: scheduled "what's new in marketing" brief cards. Unlike the graph
// endpoint, this genuinely runs the Agent SDK (WebSearch + GHL/CallRail,
// same tool scope as chat) since summarizing trend research needs an LLM.
const briefAgentConfig = {
  systemPrompt: SYSTEM_PROMPT,
  mcpServers: MCP_SERVERS,
  vaultRoot: VAULT_ROOT,
  tools: BUILTIN_TOOLS,
  disallowedTools: DISALLOWED_TOOLS,
};

app.get('/api/briefs', (req, res) => {
  res.json({ briefs: listBriefs() });
});

app.post('/api/briefs/refresh', async (req, res) => {
  try {
    const brief = await runBrief(briefAgentConfig);
    broadcast({ type: 'brief', brief });
    res.json({ brief });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.delete('/api/briefs/:id', (req, res) => {
  const briefs = deleteBrief(req.params.id);
  res.json({ briefs });
});

app.post('/api/briefs/clear', (req, res) => {
  res.json({ briefs: clearBriefs() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(payload) {
  const json = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1 /* OPEN */) client.send(json);
  }
}

// Generates a brief on startup (if the stored one is missing/stale) and
// every 24h after, pushing new ones live to any open dashboard tab instead
// of requiring a page refresh/poll.
scheduleBriefs(briefAgentConfig, (brief) => broadcast({ type: 'brief', brief }));

wss.on('connection', (ws) => {
  // Cross-turn memory per browser tab/connection: capture the Agent SDK's
  // session_id on first reply and resume it on every later ask, so the
  // conversation actually has memory instead of starting cold each turn.
  let currentSessionId = null;

  ws.send(JSON.stringify({ type: 'ready' }));

  ws.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'reset') {
      currentSessionId = null;
      ws.send(JSON.stringify({ type: 'reset-ack' }));
      return;
    }

    if (msg.type !== 'ask' || !msg.prompt || !msg.prompt.trim()) return;

    const id = msg.id;
    ws.send(JSON.stringify({ type: 'thinking', id }));

    try {
      const query = await getQuery();
      let finalText = '';
      const stream = query({
        prompt: msg.prompt,
        options: {
          systemPrompt: SYSTEM_PROMPT,
          mcpServers: MCP_SERVERS,
          cwd: VAULT_ROOT,
          tools: BUILTIN_TOOLS,
          disallowedTools: DISALLOWED_TOOLS,
          strictMcpConfig: STRICT_MCP_CONFIG,
          ...(currentSessionId ? { resume: currentSessionId } : {}),
          // No permission-approval UI here either — bypass is safe now for
          // two independent reasons instead of one: read-only enforcement
          // at the GHL/CallRail connector level (GET-only tools), AND the
          // built-in tool allow-list above means there's nothing destructive
          // (Bash/Write/Edit) left for a bypassed prompt to newly permit.
          permissionMode: 'bypassPermissions',
          allowDangerouslySkipPermissions: true,
        },
      });

      for await (const message of stream) {
        if (message.type === 'system' && message.subtype === 'init') {
          currentSessionId = message.session_id;
        }
        if (message.type === 'assistant') {
          for (const block of message.message.content) {
            if (block.type === 'text') finalText += block.text;
          }
        }
      }

      ws.send(JSON.stringify({ type: 'reply', id, text: finalText.trim() }));
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', id, message: err.message || String(err) }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`Jarvis dashboard running at http://localhost:${PORT}`);
});
