#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { CallrailApiError, CallrailClient } from "./callrail-client.js";

const apiKey = process.env.CALLRAIL_API_KEY;
if (!apiKey) {
  console.error("CALLRAIL_API_KEY is not set. Generate a key in CallRail's Settings > API Keys");
  console.error("and set it as an env var before launching.");
  process.exit(1);
}

const callrail = new CallrailClient({
  apiKey,
  defaultAccountId: process.env.CALLRAIL_ACCOUNT_ID,
});

const server = new McpServer(
  { name: "callrail-mcp-server", version: "0.1.0" },
  {
    instructions:
      "Read-only tools over the CallRail v3 API for Project Jarvis's Marketing and Sales " +
      "sub-agents. All tools default to the account set in CALLRAIL_ACCOUNT_ID unless " +
      "accountId is passed explicitly. Note: lead_status and value are documented as the " +
      "primary lead-qualification fields but are 0% populated in the live Shumaker Roofing " +
      "account — tags and lead_score (Premium Conversation Intelligence) are the fields " +
      "actually in use. See Project Jarvis/CallRail v3.md.",
  },
);

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(err: unknown, hint: string) {
  const message = err instanceof CallrailApiError ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `${message}\n${hint}` }],
  };
}

const accountIdParam = z
  .string()
  .optional()
  .describe("CallRail account ID. Defaults to CALLRAIL_ACCOUNT_ID from the environment if omitted.");

const fieldsParam = z
  .string()
  .optional()
  .describe(
    "Comma-separated extra fields to include, e.g. " +
      "'lead_status,value,tags,keywords' or (Premium CI only) " +
      "'transcription,sentiment,lead_score,call_summary'. Most qualification fields are " +
      "NOT returned by default and must be requested here.",
  );

server.registerTool(
  "list_accounts",
  {
    title: "List CallRail Accounts",
    description:
      "List accounts visible to this API key. Useful for finding an accountId before calling " +
      "other tools, and as an auth smoke test.",
    inputSchema: {},
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async () => {
    try {
      return textResult(await callrail.listAccounts());
    } catch (err) {
      return errorResult(err, "Check that CALLRAIL_API_KEY is valid.");
    }
  },
);

server.registerTool(
  "list_calls",
  {
    title: "List CallRail Calls",
    description:
      "List calls for an account, optionally filtered by date range and answered status. " +
      "Use `fields` to pull lead-qualification data (see the fields param description) — " +
      "the default response omits most of it.",
    inputSchema: {
      accountId: accountIdParam,
      startDate: z.string().optional().describe("ISO date lower bound, e.g. 2026-06-01."),
      endDate: z.string().optional().describe("ISO date upper bound, e.g. 2026-06-30."),
      fields: fieldsParam,
      answeredOnly: z.boolean().optional().describe("If true, only return answered calls."),
      limit: z.number().int().min(1).max(250).default(20).describe("Calls per page (max 250)."),
      page: z.number().int().min(1).default(1).describe("Page number for pagination."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ accountId, startDate, endDate, fields, answeredOnly, limit, page }) => {
    try {
      return textResult(
        await callrail.listCalls({ accountId, startDate, endDate, fields, answeredOnly, limit, page }),
      );
    } catch (err) {
      return errorResult(err, "Use list_accounts to find a valid accountId, and check the date format.");
    }
  },
);

server.registerTool(
  "get_call",
  {
    title: "Get CallRail Call",
    description:
      "Fetch a single call by ID. Use `fields` to pull Premium Conversation Intelligence data " +
      "(transcription, sentiment, lead_score) if the account has that add-on.",
    inputSchema: {
      callId: z.string().describe("CallRail call ID, from list_calls."),
      accountId: accountIdParam,
      fields: fieldsParam,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ callId, accountId, fields }) => {
    try {
      return textResult(await callrail.getCall(callId, { accountId, fields }));
    } catch (err) {
      return errorResult(err, "Use list_calls to find a valid callId.");
    }
  },
);

server.registerTool(
  "list_tags",
  {
    title: "List CallRail Tags",
    description:
      "List all tags defined for an account. Useful for interpreting the `tags` array on " +
      "calls — in the live Shumaker Roofing account this is the main qualification signal " +
      "actually in use (lead_status/value are unset), e.g. 'Schedule requested/booked'.",
    inputSchema: { accountId: accountIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ accountId }) => {
    try {
      return textResult(await callrail.listTags({ accountId }));
    } catch (err) {
      return errorResult(err, "Check that CALLRAIL_ACCOUNT_ID or accountId is a valid account.");
    }
  },
);

server.registerTool(
  "list_companies",
  {
    title: "List CallRail Companies",
    description: "List companies (tracking-number groupings) under an account.",
    inputSchema: {
      accountId: accountIdParam,
      limit: z.number().int().min(1).max(250).default(20).describe("Companies per page (max 250)."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ accountId, limit }) => {
    try {
      return textResult(await callrail.listCompanies({ accountId, limit }));
    } catch (err) {
      return errorResult(err, "Check that CALLRAIL_ACCOUNT_ID or accountId is a valid account.");
    }
  },
);

server.registerTool(
  "list_form_submissions",
  {
    title: "List CallRail Form Submissions",
    description:
      "List web form submissions tracked by CallRail for an account, optionally filtered by " +
      "date range. Relevant to the Marketing sub-agent's source/medium/GCLID attribution work.",
    inputSchema: {
      accountId: accountIdParam,
      startDate: z.string().optional().describe("ISO date lower bound, e.g. 2026-06-01."),
      endDate: z.string().optional().describe("ISO date upper bound, e.g. 2026-06-30."),
      limit: z.number().int().min(1).max(250).default(20).describe("Submissions per page (max 250)."),
      page: z.number().int().min(1).default(1).describe("Page number for pagination."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ accountId, startDate, endDate, limit, page }) => {
    try {
      return textResult(
        await callrail.listFormSubmissions({ accountId, startDate, endDate, limit, page }),
      );
    } catch (err) {
      return errorResult(err, "Check that CALLRAIL_ACCOUNT_ID or accountId is a valid account.");
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
