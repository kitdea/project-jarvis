// Builds a live knowledge-graph snapshot from GHL + CallRail data for the
// dashboard's graph panel. This deliberately does NOT go through the Agent
// SDK/LLM — it's a direct REST pull (same APIs the ghl-mcp-server and
// callrail-mcp-server wrap) because building a node/edge structure from
// bulk records is a plain data task, not something that benefits from an
// LLM in the loop. Cached in memory with a TTL so opening the graph panel
// repeatedly doesn't hammer either API.

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';
const CALLRAIL_BASE_URL = 'https://api.callrail.com/v3';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache = null; // { data, fetchedAt }

// Caps to keep the graph readable and the payload bounded — see
// Project Jarvis/Recommendations.md #8 on unbounded-payload risk. Not a
// silent cap: reported back in the response's `truncated` field.
const MAX_CONTACTS = 60;
const MAX_OPPORTUNITIES = 60;
const MAX_CALLS = 60;

// NOTE: does NOT auto-inject a locationId param — GHL's endpoints are
// inconsistent about the param name (`/contacts/` and
// `/opportunities/pipelines` want `locationId`, `/opportunities/search`
// wants `location_id`), confirmed against mcp-servers/ghl-mcp-server's
// ghl-client.ts. Learned this live: an earlier version of this function set
// `locationId` unconditionally and broke /opportunities/search with a 422
// ("property locationId should not exist"). Callers must pass the correct
// param name explicitly.
async function ghlRequest(token, path, params = {}) {
  const url = new URL(path, GHL_BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_API_VERSION,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`GHL ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

async function callrailRequest(apiKey, accountId, path, params = {}) {
  const url = new URL(`${CALLRAIL_BASE_URL}/a/${accountId}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Token token="${apiKey}"`, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`CallRail ${path} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : null;
}

async function buildGraph({ ghlEnv, callrailEnv }) {
  const nodes = [];
  const links = [];
  const errors = [];
  const seen = new Set();
  const addNode = (node) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    nodes.push(node);
  };

  const contactPhoneIndex = new Map(); // normalized phone -> contact node id

  // --- GHL: pipelines, opportunities, contacts ---
  if (ghlEnv.GHL_PRIVATE_TOKEN && ghlEnv.GHL_LOCATION_ID) {
    try {
      const pipelineData = await ghlRequest(
        ghlEnv.GHL_PRIVATE_TOKEN,
        '/opportunities/pipelines',
        { locationId: ghlEnv.GHL_LOCATION_ID },
      );
      for (const p of pipelineData.pipelines ?? []) {
        addNode({ id: `pipeline:${p.id}`, name: p.name, type: 'Campaign' });
      }

      const oppData = await ghlRequest(
        ghlEnv.GHL_PRIVATE_TOKEN,
        '/opportunities/search',
        { location_id: ghlEnv.GHL_LOCATION_ID, limit: String(MAX_OPPORTUNITIES) },
      );
      for (const o of (oppData.opportunities ?? []).slice(0, MAX_OPPORTUNITIES)) {
        const oppId = `opp:${o.id}`;
        addNode({ id: oppId, name: o.name ?? 'Opportunity', type: 'Project' });
        if (o.pipelineId && seen.has(`pipeline:${o.pipelineId}`)) {
          links.push({ source: oppId, target: `pipeline:${o.pipelineId}` });
        }
        if (o.contactId) {
          const contactNodeId = `contact:${o.contactId}`;
          links.push({ source: oppId, target: contactNodeId });
        }
      }

      const contactData = await ghlRequest(
        ghlEnv.GHL_PRIVATE_TOKEN,
        '/contacts/',
        { locationId: ghlEnv.GHL_LOCATION_ID, limit: String(MAX_CONTACTS) },
      );
      for (const c of (contactData.contacts ?? []).slice(0, MAX_CONTACTS)) {
        const contactId = `contact:${c.id}`;
        const name = c.contactName || c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email || 'Contact';
        addNode({ id: contactId, name, type: 'Person' });
        const phone = normalizePhone(c.phone);
        if (phone) contactPhoneIndex.set(phone, contactId);
      }
    } catch (err) {
      errors.push(`GHL: ${err.message}`);
    }
  } else {
    errors.push('GHL: GHL_PRIVATE_TOKEN/GHL_LOCATION_ID not set, skipped.');
  }

  // --- CallRail: companies, tags, calls ---
  if (callrailEnv.CALLRAIL_API_KEY && callrailEnv.CALLRAIL_ACCOUNT_ID) {
    try {
      const companies = await callrailRequest(
        callrailEnv.CALLRAIL_API_KEY,
        callrailEnv.CALLRAIL_ACCOUNT_ID,
        '/companies.json',
      );
      for (const co of companies.companies ?? companies ?? []) {
        addNode({ id: `company:${co.id}`, name: co.name, type: 'Client' });
      }

      const calls = await callrailRequest(
        callrailEnv.CALLRAIL_API_KEY,
        callrailEnv.CALLRAIL_ACCOUNT_ID,
        '/calls.json',
        // Verified live 2026-08-07: `tags` on a call is an array of full
        // tag objects ({id, name, ...}), not bare IDs — read `.name`
        // directly, no separate /tags.json lookup needed. `company_id`
        // isn't in the default payload either; request it explicitly like
        // `tags`. (Still unconfirmed live whether company_id actually
        // populates once requested — if it doesn't, call->company links
        // will just stay empty, not error.)
        { per_page: String(MAX_CALLS), fields: 'tags,company_id' },
      );
      for (const call of (calls.calls ?? []).slice(0, MAX_CALLS)) {
        const callId = `call:${call.id}`;
        addNode({ id: callId, name: call.customer_name || call.customer_phone_number || 'Call', type: 'Call' });

        if (call.company_id && seen.has(`company:${call.company_id}`)) {
          links.push({ source: callId, target: `company:${call.company_id}` });
        }

        for (const tag of call.tags ?? []) {
          const tagName = typeof tag === 'string' ? tag : tag.name;
          if (!tagName) continue;
          const tagNodeId = `tag:${tagName}`;
          addNode({ id: tagNodeId, name: tagName, type: 'Concept' });
          links.push({ source: callId, target: tagNodeId });
        }

        const phone = normalizePhone(call.customer_phone_number);
        if (phone && contactPhoneIndex.has(phone)) {
          links.push({ source: callId, target: contactPhoneIndex.get(phone) });
        }
      }
    } catch (err) {
      errors.push(`CallRail: ${err.message}`);
    }
  } else {
    errors.push('CallRail: CALLRAIL_API_KEY/CALLRAIL_ACCOUNT_ID not set, skipped.');
  }

  // Degree, for client-side sizing.
  const degree = new Map();
  for (const l of links) {
    degree.set(l.source, (degree.get(l.source) ?? 0) + 1);
    degree.set(l.target, (degree.get(l.target) ?? 0) + 1);
  }
  for (const n of nodes) n.degree = degree.get(n.id) ?? 0;

  return {
    nodes,
    links,
    errors,
    truncated: { contacts: MAX_CONTACTS, opportunities: MAX_OPPORTUNITIES, calls: MAX_CALLS },
  };
}

async function getGraph({ ghlEnv, callrailEnv, forceRefresh = false }) {
  const now = Date.now();
  if (!forceRefresh && cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return { ...cache.data, cachedAt: cache.fetchedAt };
  }
  const data = await buildGraph({ ghlEnv, callrailEnv });
  cache = { data, fetchedAt: now };
  return { ...data, cachedAt: now };
}

module.exports = { getGraph };
