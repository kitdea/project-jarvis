const QUERY_URL = "https://api.supermetrics.com/enterprise/v2/query/data";

export class SupermetricsApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Supermetrics API error ${status}: ${body}`);
  }
}

export interface SupermetricsClientConfig {
  apiKey: string;
  defaultDsId?: string; // e.g. "GAWA" for Google Ads
  defaultDsAccounts?: string; // e.g. "8531416360" (matches the account already used via the
  // claude.ai Supermetrics connector for Shumaker's Google Ads pulls — see
  // Project Jarvis/Google Ads API.md)
}

/**
 * Thin wrapper over the Supermetrics API v2 (api.supermetrics.com), a
 * meta-connector over 150+ marketing/analytics/ads data sources. Docs:
 * https://docs.supermetrics.com/apidocs/making-requests
 *
 * IMPORTANT — confidence level: the base URL, auth method (api_key param or
 * Bearer header), and the /enterprise/v2/query/data endpoint + core
 * parameter names (ds_id, ds_accounts, start_date, end_date, fields,
 * filter, order_rows, max_rows) are confirmed against Supermetrics' own
 * documentation as of 2026-08. NOT independently verified: the exact
 * discovery flow (data_source_discovery / accounts_discovery / field_discovery
 * equivalents that the claude.ai Supermetrics connector exposes) — this
 * server does not implement discovery endpoints, only the query itself.
 * Callers need to already know `dsId` (data source ID, e.g. "GAWA" for
 * Google Ads), `dsAccounts` (account ID(s)), and valid `fields` for that
 * data source. Verify live with `npm run inspect` once
 * SUPERMETRICS_API_KEY is set, and add a discovery tool once its real
 * endpoint shape is confirmed.
 */
export class SupermetricsClient {
  constructor(private config: SupermetricsClientConfig) {}

  async query(opts: {
    dsId?: string;
    dsAccounts?: string;
    startDate: string;
    endDate: string;
    fields: string;
    filter?: string;
    orderRows?: string;
    maxRows?: number;
  }) {
    const dsId = opts.dsId ?? this.config.defaultDsId;
    const dsAccounts = opts.dsAccounts ?? this.config.defaultDsAccounts;
    if (!dsId) {
      throw new Error(
        "No dsId provided and SUPERMETRICS_DEFAULT_DS_ID is not set. " +
          "dsId identifies the data source, e.g. 'GAWA' for Google Ads.",
      );
    }
    if (!dsAccounts) {
      throw new Error(
        "No dsAccounts provided and SUPERMETRICS_DEFAULT_DS_ACCOUNTS is not set.",
      );
    }

    const body = {
      api_key: this.config.apiKey,
      ds_id: dsId,
      ds_accounts: dsAccounts,
      start_date: opts.startDate,
      end_date: opts.endDate,
      fields: opts.fields,
      filter: opts.filter,
      order_rows: opts.orderRows,
      max_rows: opts.maxRows,
    };

    const res = await fetch(QUERY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) throw new SupermetricsApiError(res.status, text);

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}
