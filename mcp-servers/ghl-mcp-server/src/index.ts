#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GhlApiError, GhlClient } from "./ghl-client.js";

const privateToken = process.env.GHL_PRIVATE_TOKEN;
if (!privateToken) {
  console.error("GHL_PRIVATE_TOKEN is not set. Create a Private Integration Token in GHL");
  console.error("(Settings > Private Integrations) and set it as an env var before launching.");
  process.exit(1);
}

const ghl = new GhlClient({
  privateToken,
  defaultLocationId: process.env.GHL_LOCATION_ID,
});

const server = new McpServer(
  { name: "ghl-mcp-server", version: "0.1.0" },
  {
    instructions:
      "Read-only tools over the GoHighLevel v2 API for the Project Jarvis Marketing sub-agent. " +
      "All tools default to the location set in GHL_LOCATION_ID unless locationId is passed explicitly.",
  },
);

function textResult(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(err: unknown, hint: string) {
  const message = err instanceof GhlApiError ? err.message : String(err);
  return {
    isError: true,
    content: [{ type: "text" as const, text: `${message}\n${hint}` }],
  };
}

const locationIdParam = z
  .string()
  .optional()
  .describe("GHL location ID. Defaults to GHL_LOCATION_ID from the environment if omitted.");

server.registerTool(
  "list_contacts",
  {
    title: "List GHL Contacts",
    description:
      "List contacts in a GoHighLevel location, optionally filtered by search query. " +
      "Used for lead attribution lookups. Does NOT fetch full contact detail — use get_contact for that. " +
      "Docs: https://highlevel.stoplight.io/docs/integrations/6ee1e93c8b34d-search-contacts",
    inputSchema: {
      locationId: locationIdParam,
      query: z.string().optional().describe("Free-text search across name, email, phone."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max contacts to return."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ locationId, query, limit }) => {
    try {
      return textResult(await ghl.listContacts({ locationId, query, limit }));
    } catch (err) {
      return errorResult(err, "Check that GHL_LOCATION_ID or locationId is a valid location.");
    }
  },
);

server.registerTool(
  "get_contact",
  {
    title: "Get GHL Contact",
    description:
      "Fetch full detail for a single GoHighLevel contact by its ID. " +
      "Get the contactId from list_contacts first — IDs aren't guessable. " +
      "Docs: https://highlevel.stoplight.io/docs/integrations/0443aa46969b8-get-contact",
    inputSchema: {
      contactId: z.string().describe("GHL contact ID, e.g. from list_contacts."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ contactId }) => {
    try {
      return textResult(await ghl.getContact(contactId));
    } catch (err) {
      return errorResult(err, "Use list_contacts to find a valid contactId.");
    }
  },
);

server.registerTool(
  "list_opportunities",
  {
    title: "List GHL Opportunities",
    description:
      "List opportunities (pipeline deals) in a GoHighLevel location, optionally filtered by " +
      "pipeline or status. Use get_pipeline_stages first to resolve pipeline/stage names to IDs. " +
      "Docs: https://highlevel.stoplight.io/docs/integrations/3f77c39defef4-search-opportunity",
    inputSchema: {
      locationId: locationIdParam,
      pipelineId: z.string().optional().describe("Restrict to one pipeline. From get_pipeline_stages."),
      status: z
        .enum(["open", "won", "lost", "abandoned", "all"])
        .optional()
        .describe("Filter by opportunity status. Omit for all statuses."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max opportunities to return."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ locationId, pipelineId, status, limit }) => {
    try {
      return textResult(await ghl.listOpportunities({ locationId, pipelineId, status, limit }));
    } catch (err) {
      return errorResult(err, "Check that pipelineId (if given) came from get_pipeline_stages.");
    }
  },
);

server.registerTool(
  "get_pipeline_stages",
  {
    title: "Get GHL Pipelines & Stages",
    description:
      "List all pipelines and their stages for a GoHighLevel location. Call this before " +
      "list_opportunities when you need to filter or interpret opportunities by pipeline/stage name. " +
      "Docs: https://highlevel.stoplight.io/docs/integrations/b3A6MzUyNTQ0OTU-get-pipelines",
    inputSchema: { locationId: locationIdParam },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ locationId }) => {
    try {
      return textResult(await ghl.getPipelineStages({ locationId }));
    } catch (err) {
      return errorResult(err, "Check that GHL_LOCATION_ID or locationId is a valid location.");
    }
  },
);

server.registerTool(
  "list_conversations",
  {
    title: "List GHL Conversations",
    description:
      "List conversation threads in a GoHighLevel location, optionally filtered to one contact. " +
      "Returns conversation summaries, not message bodies — use get_conversation_messages for those. " +
      "Docs: https://highlevel.stoplight.io/docs/integrations/8b7b73027a860-search-conversations",
    inputSchema: {
      locationId: locationIdParam,
      contactId: z.string().optional().describe("Restrict to conversations with this contact."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max conversations to return."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ locationId, contactId, limit }) => {
    try {
      return textResult(await ghl.listConversations({ locationId, contactId, limit }));
    } catch (err) {
      return errorResult(err, "Use get_contact/list_contacts to confirm the contactId exists.");
    }
  },
);

server.registerTool(
  "get_conversation_messages",
  {
    title: "Get GHL Conversation Messages",
    description:
      "Fetch the message history for a single GoHighLevel conversation. " +
      "Get the conversationId from list_conversations first. " +
      "Docs: https://highlevel.stoplight.io/docs/integrations/59b3392c825a2-get-messages",
    inputSchema: {
      conversationId: z.string().describe("GHL conversation ID, from list_conversations."),
      limit: z.number().int().min(1).max(100).default(20).describe("Max messages to return."),
    },
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  },
  async ({ conversationId, limit }) => {
    try {
      return textResult(await ghl.getConversationMessages(conversationId, limit));
    } catch (err) {
      return errorResult(err, "Use list_conversations to find a valid conversationId.");
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
