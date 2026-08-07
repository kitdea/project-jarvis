// "What's new in marketing" brief cards — Step 6 of the dashboard rebuild.
// Runs a real Agent SDK query (WebSearch + GHL/CallRail, same scope as
// chat) on a schedule, stores results, and serves them to the dashboard's
// card UI. Unlike graph.js, this genuinely needs the LLM in the loop —
// summarizing/synthesizing trend research isn't a plain data-shaping task.

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'briefs-data.json');
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_STORED = 20;

const BRIEF_PROMPT = `Give me a "what's new in marketing" brief for Shumaker Roofing Co.
Use web search for anything time-sensitive — don't rely on training knowledge for
recent trends, platform changes, or industry news. Cover, briefly:
1. Any notable recent marketing/advertising trend, platform change (Google Ads, SEO,
   GHL/CRM, home-services marketing specifically if you find it), or industry news
   from roughly the last 1-2 weeks that's relevant to a roofing company's marketing.
2. A one-line pulse on current lead activity if you can pull it quickly from GHL/CallRail
   (e.g. rough sense of recent leads/calls) — skip this if it would take many tool calls.
Keep the whole thing tight — a few short paragraphs or a short list, spoken-friendly
(this may be read aloud), not a long report. Cite what you found via web search briefly
(source name is enough, not full URLs).`;

let queryPromise;
function getQuery() {
  if (!queryPromise) {
    queryPromise = import('@anthropic-ai/claude-agent-sdk').then((mod) => mod.query);
  }
  return queryPromise;
}

function loadStore() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveStore(briefs) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(briefs, null, 2));
}

function listBriefs() {
  return loadStore();
}

function deleteBrief(id) {
  const briefs = loadStore().filter((b) => b.id !== id);
  saveStore(briefs);
  return briefs;
}

function clearBriefs() {
  saveStore([]);
  return [];
}

async function runBrief({ systemPrompt, mcpServers, vaultRoot, tools, disallowedTools }) {
  const query = await getQuery();
  let finalText = '';
  const stream = query({
    prompt: BRIEF_PROMPT,
    options: {
      systemPrompt,
      mcpServers,
      cwd: vaultRoot,
      tools,
      disallowedTools,
      strictMcpConfig: true,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      // Each brief is a standalone one-off — no `resume`, deliberately not
      // tied to any chat session's conversation memory.
    },
  });

  for await (const message of stream) {
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') finalText += block.text;
      }
    }
  }

  const brief = {
    id: `brief_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: 'Marketing Brief',
    text: finalText.trim(),
    createdAt: Date.now(),
  };

  const briefs = [brief, ...loadStore()].slice(0, MAX_STORED);
  saveStore(briefs);
  return brief;
}

// Runs once at startup (if the newest stored brief is missing or stale) and
// then every REFRESH_INTERVAL_MS. Broadcasts new briefs via the provided
// `onNewBrief` callback so connected dashboard tabs get it live over
// WebSocket instead of needing to poll.
function scheduleBriefs(config, onNewBrief) {
  const tick = async () => {
    try {
      const existing = loadStore();
      const newest = existing[0];
      const isStale = !newest || Date.now() - newest.createdAt > REFRESH_INTERVAL_MS;
      if (!isStale) return;
      const brief = await runBrief(config);
      onNewBrief?.(brief);
    } catch (err) {
      console.error('[briefs] scheduled generation failed:', err.message || err);
    }
  };

  tick(); // check on startup
  setInterval(tick, REFRESH_INTERVAL_MS);
}

module.exports = { runBrief, listBriefs, deleteBrief, clearBriefs, scheduleBriefs };
