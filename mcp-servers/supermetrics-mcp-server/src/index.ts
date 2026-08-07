#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SupermetricsApiError, SupermetricsClient } from "./supermetrics-client.js";

const apiKey = process.env.SUPERMETRICS_API_KEY;
if (!apiKey) {
  console.error("SUPERMETRICS_API_KEY is not set. Create one in Supermetrics under API Keys");
  console.error("(https://docs.supermetrics.com/apidocs/create-api-key-1) and set it as an env");
  console.error("var before launching.");
  process.exit(1);
}

const supermetrics = new SupermetricsClient({
  apiKey,
  defaultDsId: process.env.SUPERMETRICS_DEFAULT_DS_ID,
  defaultDsAccounts: process.env.SUPERMETRICS_DEFAULT_DS_ACCOUNTS,
});

const server = new McpServer(
  { name: "supermetrics-mcp-server", version: "0.1.0" },
  {
    instructions:
      "Read-only query tool over the Supermetrics API v2 for Project Jarvis's Marketing " +
      "sub-agent — pulls data from whatever sources (Google Ads, etc.) are configured on the " +
      "connected Supermetrics account. Unlike the claude.ai Supermetrics connector, this server " +
      "has no discovery tools (no data_source_discovery/field_discovery equivalent) — the " +
      "caller must already know dsId, dsAccounts, and valid field names for the data source " +
      "being queried. For Shumaker Roofing's Google Ads account (dsId 'GAWA', account " +
      "8531416360), see Project Jarvis/Google Ads API.md for confirmed field names already " +
      "used via the claude.ai connector.",
  },
);

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] };
}

function errorResult(err: unknown, hint: string) {
  const message = err instanceof SupermetricsApiError ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `${message}\n${hint}` }],
  };
}

server.registerTool(
  "query",
  {
    title: "Run Supermetrics Query",
    description:
      "Run a data query against a Supermetrics-connected data source (e.g. Google Ads). " +
      "Requires knowing the data source's dsId, account ID(s), and valid field names in " +
      "advance — this tool does not discover them for you. Defaults dsId/dsAccounts from " +
      "SUPERMETRICS_DEFAULT_DS_ID / SUPERMETRICS_DEFAULT_DS_ACCOUNTS if omitted.",
    inputSchema: {
      dsId: z.string().optional().describe("Data source ID, e.g. 'GAWA' for Google Ads. Defaults to SUPERMETRICS_DEFAULT_DS_ID."),
      dsAccounts: z.string().optional().describe("Account ID(s), comma-separated if multiple. Defaults to SUPERMETRICS_DEFAULT_DS_ACCOUNTS."),
      startDate: z.string().describe("ISO date or relative value Supermetrics accepts, e.g. '2026-07-01' or 'today'."),
      endDate: z.string().describe("ISO date or relative value, e.g. '2026-07-31' or 'today'."),
      fields: z.string().describe("Comma-separated field names, e.g. 'date, campaign_name, clicks, cost'."),
      filter: z.string().optional().describe("Supermetrics filter expression, e.g. 'impressions > 0'."),
      orderRows: z.string().optional().describe("Sort expression, e.g. 'cost desc'."),
      maxRows: z.number().int().min(1).max(10000).optional().describe("Row cap (be mindful of large payloads — see Recommendations.md #8 on unbounded-payload risk)."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ dsId, dsAccounts, startDate, endDate, fields, filter, orderRows, maxRows }) => {
    try {
      return textResult(
        await supermetrics.query({ dsId, dsAccounts, startDate, endDate, fields, filter, orderRows, maxRows }),
      );
    } catch (err) {
      return errorResult(
        err,
        "Check dsId/dsAccounts/field names against Supermetrics' own docs or the claude.ai " +
          "Supermetrics connector's discovery tools — this server can't discover them for you.",
      );
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
