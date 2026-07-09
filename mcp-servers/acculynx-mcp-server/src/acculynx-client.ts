const BASE_URL = "https://api.acculynx.com/api/v2";

export class AcculynxApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`AccuLynx API error ${status}: ${body}`);
  }
}

export interface AcculynxClientConfig {
  apiKey: string;
}

/**
 * Thin wrapper over the AccuLynx v2 REST API (api.acculynx.com).
 * Docs: AccuLynx's public OpenAPI/llms.txt index — see Project Jarvis/AccuLynx.md
 * for the endpoint catalog, rate limits, and the "no read-only key scope" caveat.
 */
export class AcculynxClient {
  constructor(private config: AcculynxClientConfig) {}

  private async request(path: string, searchParams: Record<string, string | undefined> = {}) {
    // BASE_URL has a path component (/api/v2), so `new URL(path, BASE_URL)`
    // would discard it — an absolute `path` resolves against the origin only.
    const url = new URL(`${BASE_URL}${path}`);
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();
    if (!res.ok) throw new AcculynxApiError(res.status, text);
    return JSON.parse(text);
  }

  listJobs(opts: {
    milestone?: string;
    sort?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    extraParams?: Record<string, string>;
  }) {
    return this.request("/jobs", {
      milestone: opts.milestone,
      sort: opts.sort,
      dateFrom: opts.dateFrom,
      dateTo: opts.dateTo,
      limit: opts.limit ? String(opts.limit) : undefined,
      ...opts.extraParams,
    });
  }

  searchJobs(opts: { query: string; limit?: number }) {
    return this.request("/jobs/search", {
      query: opts.query,
      limit: opts.limit ? String(opts.limit) : undefined,
    });
  }

  getJobMilestones(jobId: string) {
    return this.request(`/jobs/${jobId}/milestones`);
  }

  getJobFinancials(jobId: string) {
    return this.request(`/jobs/${jobId}/financials`);
  }

  getJobInvoices(jobId: string) {
    return this.request(`/jobs/${jobId}/invoices`);
  }

  getJobPayments(jobId: string) {
    return this.request(`/jobs/${jobId}/payments`);
  }

  getJobPaymentsOverview(jobId: string) {
    return this.request(`/jobs/${jobId}/payments-overview`);
  }

  getJobSalesOwner(jobId: string) {
    return this.request(`/jobs/${jobId}/sales-owner`);
  }

  getJobRepresentatives(jobId: string) {
    return this.request(`/jobs/${jobId}/representatives`);
  }

  listUsers(opts: { status?: string; limit?: number }) {
    return this.request("/users", {
      status: opts.status,
      limit: opts.limit ? String(opts.limit) : undefined,
    });
  }
}
