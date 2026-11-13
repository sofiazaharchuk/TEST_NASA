// NASA OSDR (Open Science Data Repository) search API: real published space-biology and astronaut-health studies.
// Live when possible, last saved answer otherwise, nothing when neither. The card is simply hidden if NASA answers in an unexpected shape.
export interface OsdrStudy { id: string; title: string }
export interface OsdrData { term: string; total: number; studies: OsdrStudy[] }
export interface OsdrResult { source: "live" | "archive" | "none"; data: OsdrData | null; error?: string }
interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
export const osdrStudyUrl = (id: string) => `https://osdr.nasa.gov/bio/repo/data/studies/${id}`;
export const osdrSearchUrl = (term: string, size = 3) => `https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(term)}&from=0&size=${size}&type=cgene`;
const text = (x: unknown) => (typeof x === "string" ? x.replace(/\s+/g, " ").trim() : "");
/**
 * Never trust the network. Accepts the Elasticsearch-style answer {hits:{total, hits:[{_id,_source}]}}; the total may be a number or {value}.
 * A study is kept only with an OSD-number and a title. Without a usable total nothing is shown (null).
 */
export function parseOsdr(j: unknown, term: string): OsdrData | null {
  if (!isObj(j) || !isObj(j.hits)) return null;
  const t = j.hits.total, total = typeof t === "number" ? t : isObj(t) && typeof t.value === "number" ? t.value : NaN;
  if (!Number.isFinite(total) || total < 0) return null;
  const rows = Array.isArray(j.hits.hits) ? j.hits.hits : [];
  const studies = rows.flatMap((r): OsdrStudy[] => {
    if (!isObj(r)) return [];
    const s = isObj(r._source) ? r._source : {};
    const id = [r._id, s.Accession, s.accession, s["Study Identifier"]].map(text).find(v => /^OSD-\d+$/.test(v));
    const title = [s["Study Title"], s.title, s["Project Title"], s.Title].map(text).find(Boolean);
    return id && title ? [{ id, title: title.length > 140 ? title.slice(0, 137) + "…" : title }] : [];
  });
  return { term, total, studies: studies.slice(0, 3) };
}
const CACHE_KEY = "oa.osdr.v1", FRESH_MS = 24 * 3600_000;
const read = (kv: KV | undefined, term: string): { savedAt: number; data: OsdrData } | null => {
  try {
    const j: unknown = JSON.parse(kv?.getItem(CACHE_KEY) ?? "null");
    if (!isObj(j) || typeof j.savedAt !== "number" || !isObj(j.data) || j.data.term !== term) return null;
    const rows = (Array.isArray(j.data.studies) ? j.data.studies : []).map((s: unknown) => (isObj(s) ? { _id: s.id, _source: { title: s.title } } : null));
    const data = parseOsdr({ hits: { total: j.data.total, hits: rows } }, term);
    return data ? { savedAt: j.savedAt, data } : null;
  } catch { return null; }
};
/** Order: fresh cache (24 h) -> live request -> older saved answer -> none. "live" only for data from NASA in the last 24 hours. */
export async function loadOsdr(o: { term?: string; fetcher?: typeof fetch; storage?: KV; now?: number; timeoutMs?: number } = {}): Promise<OsdrResult> {
  const { term = "bone", fetcher = fetch, storage, now = Date.now(), timeoutMs = 12000 } = o, cached = read(storage, term);
  if (cached && now - cached.savedAt < FRESH_MS) return { source: "live", data: cached.data };
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetcher(osdrSearchUrl(term), { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = parseOsdr(await res.json(), term);
    if (!data) throw new Error("unexpected answer shape");
    try { storage?.setItem(CACHE_KEY, JSON.stringify({ savedAt: now, data })); } catch { /* storage full or blocked */ }
    return { source: "live", data };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.warn("[OSDR] live request failed:", error);
    return cached ? { source: "archive", data: cached.data, error } : { source: "none", data: null, error };
  } finally { clearTimeout(timer); }
}
