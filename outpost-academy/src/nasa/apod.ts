// NASA APOD (Astronomy Picture of the Day) via api.nasa.gov. Live when possible, last saved picture otherwise, nothing when neither.
export interface Apod { title: string; date: string; url: string; copyright?: string }
export interface ApodResult { source: "live" | "archive" | "none"; apod: Apod | null; error?: string }
interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null;
/**
 * Never trust the network: only a still image with an https address and a title is accepted (APOD is sometimes a video).
 * APOD images with a `copyright` field belong to other people, so they are NOT shown (the game only shows what it has the right to show).
 * Logos and placeholders are skipped too.
 */
export function parseApod(j: unknown): Apod | null {
  if (!isObj(j) || j.media_type !== "image" || typeof j.title !== "string" || typeof j.date !== "string" || typeof j.url !== "string" || !j.url.startsWith("https://")) return null;
  if (typeof j.copyright === "string" && j.copyright.trim()) return null;
  if (/logo|placeholder/i.test(j.url) || /^nasa( science)?$/i.test(j.title.trim())) return null;
  return { title: j.title.trim(), date: j.date, url: j.url, copyright: typeof j.copyright === "string" ? j.copyright.replace(/\s+/g, " ").trim() : undefined };
}
const CACHE_KEY = "oa.apod.v1", FRESH_MS = 6 * 3600_000;
const read = (kv?: KV): { savedAt: number; apod: Apod | null } | null => { try { const j = JSON.parse(kv?.getItem(CACHE_KEY) ?? "null"); return isObj(j) && typeof j.savedAt === "number" ? { savedAt: j.savedAt, apod: parseApod({ media_type: "image", ...(isObj(j.apod) ? j.apod : {}) }) } : null; } catch { return null; } };
/** Order: fresh cache (6 h) -> live request -> older saved picture -> none. "live" only for data from NASA in the last 6 hours. */
export async function loadApod(o: { key?: string; fetcher?: typeof fetch; storage?: KV; now?: number; timeoutMs?: number } = {}): Promise<ApodResult> {
  const { fetcher = fetch, storage, now = Date.now(), timeoutMs = 12000 } = o, key = o.key?.trim() || "DEMO_KEY", cached = read(storage);
  if (cached?.apod && now - cached.savedAt < FRESH_MS) return { source: "live", apod: cached.apod };
  try {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetcher(`https://api.nasa.gov/planetary/apod?api_key=${key}`, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const apod = parseApod(await res.json());
    if (!apod) throw new Error("not a still image today");
    try { storage?.setItem(CACHE_KEY, JSON.stringify({ savedAt: now, apod })); } catch { /* storage full or blocked */ }
    return { source: "live", apod };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.warn("[APOD] live request failed:", error);
    return cached?.apod ? { source: "archive", apod: cached.apod, error } : { source: "none", apod: null, error };
  }
}
