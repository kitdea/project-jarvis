#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { SemrushApiError, SemrushClient } from "./semrush-client.js";

const apiKey = process.env.SEMRUSH_API_KEY;
if (!apiKey) {
  console.error("SEMRUSH_API_KEY is not set. Generate a key in Semrush's profile > API keys");
  console.error("(https://developer.semrush.com/api/get-started/authorization/) and set it as");
  console.error("an env var before launching.");
  process.exit(1);
}

const semrush = new SemrushClient({
  apiKey,
  defaultDatabase: process.env.SEMRUSH_DEFAULT_DATABASE,
});

const server = new McpServer(
  { name: "semrush-mcp-server", version: "0.1.0" },
  {
    instructions:
      "Read-only tools over the Semrush Analytics API for Project Jarvis's Marketing sub-agent " +
      "(SEO/competitive research, domain overview, keyword data). Each call consumes Semrush API " +
      "units from the account's balance — prefer targeted calls over broad exploratory ones. " +
      "Only `domain_overview` has a confirmed request/response shape as of this server's build; " +
      "`run_report` is a generic passthrough for other report types (domain_organic, " +
      "domain_adwords, phrase_this, backlinks_overview, etc.) and requires the caller to supply " +
      "`exportColumns` explicitly since column codes weren't independently verified per report " +
      "type. See Semrush's own API docs for column-code reference before using run_report.",
  },
);

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(err: unknown, hint: string) {
  const message = err instanceof SemrushApiError ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `${message}\n${hint}` }],
  };
}

const databaseParam = z
  .string()
  .optional()
  .describe(
    "Semrush regional database, e.g. 'us', 'uk', 'ca'. Defaults to SEMRUSH_DEFAULT_DATABASE " +
      "env var, or 'us' if that's unset.",
  );

server.registerTool(
  "domain_overview",
  {
    title: "Semrush Domain Overview",
    description:
      "Get a domain's organic & paid search overview: Semrush Rank, organic keyword count, " +
      "organic traffic estimate, organic traffic cost estimate, paid keyword count, paid " +
      "traffic estimate, paid traffic cost estimate. Good first call for competitor research " +
      "or checking Shumaker Roofing's own visibility.",
    inputSchema: {
      domain: z.string().describe("Root domain to look up, e.g. 'shumakerroofing.com'."),
      database: databaseParam,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ domain, database }) => {
    try {
      return textResult(await semrush.domainOverview({ domain, database }));
    } catch (err) {
      return errorResult(err, "Check SEMRUSH_API_KEY is valid and has remaining API units.");
    }
  },
);

server.registerTool(
  "run_report",
  {
    title: "Run Semrush Report (generic)",
    description:
      "Generic passthrough to any Semrush report `type` (e.g. domain_organic, domain_adwords, " +
      "phrase_this, phrase_related, backlinks_overview — see Semrush API docs for the full " +
      "list and each type's column codes). You must supply `exportColumns` yourself since this " +
      "server does not hardcode column lists for unverified report types. Use `domain_overview` " +
      "instead for the common domain-summary case, which has a confirmed shape.",
    inputSchema: {
      type: z.string().describe("Semrush report type, e.g. 'domain_organic', 'phrase_this'."),
      exportColumns: z
        .string()
        .describe("Comma-separated Semrush column codes for this report type, e.g. 'Ph,Po,Nq,Cp'."),
      domain: z.string().optional().describe("Domain, for domain_* report types."),
      phrase: z.string().optional().describe("Keyword phrase, for phrase_* report types."),
      database: databaseParam,
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ type, exportColumns, domain, phrase, database }) => {
    try {
      return textResult(await semrush.runReport({ type, exportColumns, domain, phrase, database }));
    } catch (err) {
      return errorResult(
        err,
        "Check the report `type` and `exportColumns` against Semrush's API docs — this tool " +
          "does not validate them before sending.",
      );
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
