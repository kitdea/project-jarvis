#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AcculynxApiError, AcculynxClient } from "./acculynx-client.js";

const apiKey = process.env.ACCULYNX_API_KEY;
if (!apiKey) {
  console.error("ACCULYNX_API_KEY is not set. Generate a key in AccuLynx's API settings");
  console.error("(company admin only — each location needs its own key) and set it as an");
  console.error("env var before launching.");
  process.exit(1);
}

const acculynx = new AcculynxClient({ apiKey });

const server = new McpServer(
  { name: "acculynx-mcp-server", version: "0.1.0" },
  {
    instructions:
      "Read-only tools over the AccuLynx v2 API for the Project Jarvis Sales sub-agent. " +
      "AccuLynx API keys are write-capable with no read-only scope, so this server only " +
      "implements GET endpoints — never add mutating tools here.",
  },
);

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(err: unknown, hint: string) {
  const message = err instanceof AcculynxApiError ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `${message}\n${hint}` }],
  };
}

const jobIdParam = z.string().describe("AccuLynx job ID, e.g. from list_jobs or search_jobs.");

server.registerTool(
  "list_jobs",
  {
    title: "List AccuLynx Jobs",
    description:
      "List jobs, optionally filtered by milestone or date range and sorted. " +
      "AccuLynx publishes no developer support, so these filter param names are " +
      "best-effort — if a filter doesn't behave as expected, pass the raw param via extraParams.",
    inputSchema: {
      milestone: z.string().optional().describe("Filter by milestone name/ID."),
      sort: z.string().optional().describe("Sort field, e.g. a date column."),
      dateFrom: z.string().optional().describe("ISO date lower bound."),
      dateTo: z.string().optional().describe("ISO date upper bound."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max jobs to return."),
      extraParams: z
        .record(z.string())
        .optional()
        .describe("Raw query params passed through verbatim, for filters not covered above."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ milestone, sort, dateFrom, dateTo, limit, extraParams }) => {
    try {
      return textResult(
        await acculynx.listJobs({ milestone, sort, dateFrom, dateTo, limit, extraParams }),
      );
    } catch (err) {
      return errorResult(err, "Check filter values — see Project Jarvis/Caveats.md for known gaps.");
    }
  },
);

server.registerTool(
  "search_jobs",
  {
    title: "Search AccuLynx Jobs",
    description: "Free-text search across jobs.",
    inputSchema: {
      query: z.string().describe("Search text."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max jobs to return."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ query, limit }) => {
    try {
      return textResult(await acculynx.searchJobs({ query, limit }));
    } catch (err) {
      return errorResult(err, "Try a broader search query.");
    }
  },
);

server.registerTool(
  "get_job_milestones",
  {
    title: "Get AccuLynx Job Milestones",
    description: "Fetch milestone history for a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobMilestones(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "get_job_financials",
  {
    title: "Get AccuLynx Job Financials",
    description: "Fetch the financial worksheet (plus amendments) for a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobFinancials(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "get_job_invoices",
  {
    title: "Get AccuLynx Job Invoices",
    description: "Fetch invoices for a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobInvoices(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "get_job_payments",
  {
    title: "Get AccuLynx Job Payments",
    description: "Fetch payment records for a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobPayments(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "get_job_payments_overview",
  {
    title: "Get AccuLynx Job Payments Overview",
    description: "Fetch the high-level payments overview for a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobPaymentsOverview(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "get_job_sales_owner",
  {
    title: "Get AccuLynx Job Sales Owner",
    description: "Fetch the sales rep assigned as owner of a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobSalesOwner(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "get_job_representatives",
  {
    title: "Get AccuLynx Job Representatives",
    description: "Fetch all representatives (not just the sales owner) attached to a single job.",
    inputSchema: { jobId: jobIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ jobId }) => {
    try {
      return textResult(await acculynx.getJobRepresentatives(jobId));
    } catch (err) {
      return errorResult(err, "Use list_jobs or search_jobs to find a valid jobId.");
    }
  },
);

server.registerTool(
  "list_users",
  {
    title: "List AccuLynx Users",
    description: "List AccuLynx users (reps), optionally filtered by status.",
    inputSchema: {
      status: z.string().optional().describe("Filter by user status, e.g. active/inactive."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max users to return."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ status, limit }) => {
    try {
      return textResult(await acculynx.listUsers({ status, limit }));
    } catch (err) {
      return errorResult(err, "Check the status value.");
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
