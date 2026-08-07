const BASE_URL = "https://api.semrush.com/";

export class SemrushApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Semrush API error ${status}: ${body}`);
  }
}

export interface SemrushClientConfig {
  apiKey: string;
  defaultDatabase?: string; // e.g. "us"
}

/**
 * Thin wrapper over Semrush's classic Analytics API (api.semrush.com), auth
 * via a `key` query param. Docs: https://developer.semrush.com/api/
 *
 * IMPORTANT — confidence level: only `domainOverview` (type=domain_ranks)
 * has a confirmed request/response shape (verified against Semrush's own
 * documented example as of 2026-08). Every other report type is reachable
 * only through the generic `runReport` passthrough below, which is
 * deliberately un-opinionated about `exportColumns` — Semrush's column-code
 * scheme (Ph, Po, Nq, Cp, etc. per report type) was not independently
 * verified for report types beyond domain_ranks, so this server does not
 * hardcode column lists it can't vouch for. Verify shapes live with
 * `npm run inspect` once SEMRUSH_API_KEY is set, and tighten this client
 * (or add dedicated wrapper methods) once confirmed — see
 * Project Jarvis/Semrush.md once that note exists.
 *
 * Response format: Semrush's classic API returns semicolon-delimited text
 * (a header row of column codes, then one row per result), not JSON. This
 * client parses that into an array of objects keyed by the header row.
 */
export class SemrushClient {
  constructor(private config: SemrushClientConfig) {}

  private async request(params: Record<string, string | undefined>) {
    const url = new URL(BASE_URL);
    url.searchParams.set("key", this.config.apiKey);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }

    const res = await fetch(url, { method: "GET" });
    const text = await res.text();

    if (!res.ok) throw new SemrushApiError(res.status, text);
    // Semrush returns plain-text error messages (not delimited data) for
    // problems like an invalid key or insufficient API units, prefixed
    // "ERROR" — surface those distinctly rather than trying to parse them.
    if (text.startsWith("ERROR")) throw new SemrushApiError(res.status, text);

    return parseSemicolonDelimited(text);
  }

  /** type=domain_ranks — confirmed shape. Domain overview: rank, organic &
   * paid traffic/keyword counts. */
  domainOverview(opts: { domain: string; database?: string; exportColumns?: string }) {
    return this.request({
      type: "domain_ranks",
      domain: opts.domain,
      database: opts.database ?? this.config.defaultDatabase ?? "us",
      export_columns: opts.exportColumns ?? "Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac,Sh,Sv",
    });
  }

  /** Generic passthrough for any other Semrush report `type` (e.g.
   * domain_organic, domain_adwords, phrase_this, phrase_related,
   * backlinks_overview). Caller supplies `exportColumns` explicitly since
   * this client does not hardcode unverified column-code lists — see the
   * class-level doc comment. */
  runReport(opts: {
    type: string;
    exportColumns: string;
    domain?: string;
    phrase?: string;
    database?: string;
    extraParams?: Record<string, string>;
  }) {
    return this.request({
      type: opts.type,
      export_columns: opts.exportColumns,
      domain: opts.domain,
      phrase: opts.phrase,
      database: opts.database ?? this.config.defaultDatabase ?? "us",
      ...opts.extraParams,
    });
  }
}

function parseSemicolonDelimited(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(";");
  return lines.slice(1).map((line) => {
    const cells = line.split(";");
    const row: Record<string, string> = {};
    header.forEach((col, i) => {
      row[col] = cells[i] ?? "";
    });
    return row;
  });
}
