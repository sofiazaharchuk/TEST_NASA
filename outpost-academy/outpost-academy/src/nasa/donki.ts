// NASA DONKI (Space Weather Database) solar flares. Live when possible, honest archive otherwise.
export interface Flare { id: string; classType: string; beginTime: string; peakTime?: string }
export type Weather = "calm" | "minor" | "strong";
export type Source = "live" | "archive" | "none";
export interface Result { source: Source; flares: Flare[]; fetchedAt?: string | null; error?: string }
interface Archive { fetchedAt: string | null; events: unknown[] }
interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
/** Never trust the network: keep only well-formed flare records. */
export function parseFlares(json: unknown): Flare[] {
  if (!Array.isArray(json)) return [];
  return json.flatMap(x => isObj(x) && typeof x.classType === "string" && /^[ABCMX]\d/.test(x.classType) && typeof x.beginTime === "string"
    ? [{ id: String(x.flrID ?? x.beginTime), classType: x.classType, beginTime: x.beginTime, peakTime: typeof x.peakTime === "string" ? x.peakTime : undefined }] : []);
}
export const flareRank = (c: string) => "ABCMX".indexOf(c[0]) * 100 + (parseFloat(c.slice(1)) || 0);
export const strongest = (f: Flare[]) => f.reduce<Flare | null>((m, x) => (!m || flareRank(x.classType) > flareRank(m.classType) ? x : m), null);
/** X-class flares are the strongest category, M-class medium; everything else counts as calm. */
export const weatherOf = (f: Flare | null): Weather => (!f ? "calm" : f.classType[0] === "X" ? "strong" : f.classType[0] === "M" ? "minor" : "calm");

const CACHE_KEY = "oa.donki.v1", FRESH_MS = 30 * 60 * 1000;
function readCache(kv?: KV): { savedAt: number; flares: Flare[] } | null {
  try { const j = JSON.parse(kv?.getItem(CACHE_KEY) ?? "null"); return isObj(j) && typeof j.savedAt === "number" ? { savedAt: j.savedAt, flares: parseFlares(j.flares) } : null; } catch { return null; }
}
const day = (n: number, now: number) => new Date(now - n * 864e5).toISOString().slice(0, 10);

/**
 * Order: fresh cache (under 30 min, saves the API limit) -> live request -> older cache -> bundled archive -> none.
 * The `source` is always honest: "live" only for data fetched from NASA in the last 30 minutes.
 */
export async function loadFlares(o: { days?: number; key?: string; fetcher?: typeof fetch; archive?: Archive; timeoutMs?: number; storage?: KV; now?: number } = {}): Promise<Result> {
  const { days = 30, key = "DEMO_KEY", fetcher = fetch, archive, timeoutMs = 15000, storage, now = Date.now() } = o;
  const cached = readCache(storage), iso = (t: number) => new Date(t).toISOString();
  if (cached && now - cached.savedAt < FRESH_MS) return { source: "live", flares: cached.flares, fetchedAt: iso(cached.savedAt) };
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetcher(`https://api.nasa.gov/DONKI/FLR?startDate=${day(days, now)}&endDate=${day(0, now)}&api_key=${key}`, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const flares = parseFlares(text.trim() ? JSON.parse(text) : []); // DONKI answers with an empty body when there are no events
    try { storage?.setItem(CACHE_KEY, JSON.stringify({ savedAt: now, flares })); } catch { /* storage full or blocked */ }
    return { source: "live", flares, fetchedAt: iso(now) };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.warn("[DONKI] live request failed:", error);
    if (cached) return { source: "archive", flares: cached.flares, fetchedAt: iso(cached.savedAt), error };
    const flares = parseFlares(archive?.events);
    return flares.length ? { source: "archive", flares, fetchedAt: archive?.fetchedAt, error } : { source: "none", flares: [], error };
  }
}
