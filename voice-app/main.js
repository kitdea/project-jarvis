const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const VAULT_ROOT = path.resolve(__dirname, '..');
const GHL_DIR = path.join(VAULT_ROOT, 'mcp-servers', 'ghl-mcp-server');
const CALLRAIL_DIR = path.join(VAULT_ROOT, 'mcp-servers', 'callrail-mcp-server');
const SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, 'system-prompt.md'), 'utf8');

// The Claude Agent SDK ships as an ESM-only package; load it lazily via
// dynamic import() from this CommonJS main process.
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

// Intentionally scoped to Marketing/Strategy/Info: only GHL and CallRail are
// registered. AccuLynx (sales pipeline) and any Postgres/reporting/infra
// server are never wired in, so they are unreachable regardless of prompt.
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

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('jarvis:ask', async (_event, prompt) => {
  const query = await getQuery();
  let finalText = '';
  const stream = query({
    prompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      mcpServers: MCP_SERVERS,
      cwd: VAULT_ROOT,
    },
  });

  for await (const message of stream) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') finalText += block.text;
      }
    }
  }

  return finalText.trim();
});
