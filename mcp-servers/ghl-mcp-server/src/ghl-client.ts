const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

export class GhlApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`GoHighLevel API error ${status}: ${body}`);
  }
}

export interface GhlClientConfig {
  privateToken: string;
  defaultLocationId?: string;
}

/**
 * Thin wrapper over the GoHighLevel v2 REST API (services.leadconnectorhq.com).
 * Docs: https://highlevel.stoplight.io/docs/integrations/
 */
export class GhlClient {
  constructor(private config: GhlClientConfig) {}

  private async request(path: string, searchParams: Record<string, string | undefined> = {}) {
    const url = new URL(path, BASE_URL);
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.privateToken}`,
        Version: API_VERSION,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    if (!res.ok) throw new GhlApiError(res.status, text);
    return JSON.parse(text);
  }

  private locationId(override?: string): string {
    const id = override ?? this.config.defaultLocationId;
    if (!id) {
      throw new Error(
        "No locationId provided and GHL_LOCATION_ID is not set in the environment.",
      );
    }
    return id;
  }

  listContacts(opts: { locationId?: string; query?: string; limit?: number }) {
    return this.request("/contacts/", {
      locationId: this.locationId(opts.locationId),
      query: opts.query,
      limit: opts.limit ? String(opts.limit) : undefined,
    });
  }

  getContact(contactId: string) {
    return this.request(`/contacts/${contactId}`);
  }

  listOpportunities(opts: {
    locationId?: string;
    pipelineId?: string;
    status?: string;
    limit?: number;
  }) {
    return this.request("/opportunities/search", {
      location_id: this.locationId(opts.locationId),
      pipeline_id: opts.pipelineId,
      status: opts.status,
      limit: opts.limit ? String(opts.limit) : undefined,
    });
  }

  getPipelineStages(opts: { locationId?: string }) {
    return this.request("/opportunities/pipelines", {
      locationId: this.locationId(opts.locationId),
    });
  }

  listConversations(opts: { locationId?: string; contactId?: string; limit?: number }) {
    return this.request("/conversations/search", {
      locationId: this.locationId(opts.locationId),
      contactId: opts.contactId,
      limit: opts.limit ? String(opts.limit) : undefined,
    });
  }

  getConversationMessages(conversationId: string, limit?: number) {
    return this.request(`/conversations/${conversationId}/messages`, {
      limit: limit ? String(limit) : undefined,
    });
  }
}
