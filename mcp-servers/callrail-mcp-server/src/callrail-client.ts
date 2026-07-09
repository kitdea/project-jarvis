const BASE_URL = "https://api.callrail.com/v3";

export class CallrailApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`CallRail API error ${status}: ${body}`);
  }
}

export interface CallrailClientConfig {
  apiKey: string;
  defaultAccountId?: string;
}

/**
 * Thin wrapper over the CallRail v3 REST API (api.callrail.com).
 * Docs: CallRail's public API reference — see Project Jarvis/CallRail v3.md
 * for the confirmed endpoint list, rate limits, and the lead-qualification
 * field caveats (lead_status/value are 0% populated in the live account).
 */
export class CallrailClient {
  constructor(private config: CallrailClientConfig) {}

  private async request(path: string, searchParams: Record<string, string | undefined> = {}) {
    const url = new URL(`${BASE_URL}${path}`);
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token token="${this.config.apiKey}"`,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    if (!res.ok) throw new CallrailApiError(res.status, text);
    return JSON.parse(text);
  }

  private accountId(override?: string): string {
    const id = override ?? this.config.defaultAccountId;
    if (!id) {
      throw new Error(
        "No accountId provided and CALLRAIL_ACCOUNT_ID is not set in the environment. " +
          "Use list_accounts to find one.",
      );
    }
    return id;
  }

  listAccounts() {
    return this.request("/a.json");
  }

  listCalls(opts: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    fields?: string;
    answeredOnly?: boolean;
    limit?: number;
    page?: number;
  }) {
    return this.request(`/a/${this.accountId(opts.accountId)}/calls.json`, {
      start_date: opts.startDate,
      end_date: opts.endDate,
      fields: opts.fields,
      answered: opts.answeredOnly ? "true" : undefined,
      per_page: opts.limit ? String(opts.limit) : undefined,
      page: opts.page ? String(opts.page) : undefined,
    });
  }

  getCall(callId: string, opts: { accountId?: string; fields?: string }) {
    return this.request(`/a/${this.accountId(opts.accountId)}/calls/${callId}.json`, {
      fields: opts.fields,
    });
  }

  listTags(opts: { accountId?: string }) {
    return this.request(`/a/${this.accountId(opts.accountId)}/tags.json`);
  }

  listCompanies(opts: { accountId?: string; limit?: number }) {
    return this.request(`/a/${this.accountId(opts.accountId)}/companies.json`, {
      per_page: opts.limit ? String(opts.limit) : undefined,
    });
  }

  listFormSubmissions(opts: {
    accountId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }) {
    return this.request(`/a/${this.accountId(opts.accountId)}/form_submissions.json`, {
      start_date: opts.startDate,
      end_date: opts.endDate,
      per_page: opts.limit ? String(opts.limit) : undefined,
      page: opts.page ? String(opts.page) : undefined,
    });
  }
}
