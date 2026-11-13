// Shared helpers for the tools: read the NASA key from the environment or .env, and retry flaky requests.
import { existsSync, readFileSync } from "node:fs";
export function nasaKey() {
  if (process.env.NASA_API_KEY) return process.env.NASA_API_KEY.trim();
  if (existsSync(".env")) { const m = readFileSync(".env", "utf8").match(/^\s*VITE_NASA_API_KEY\s*=\s*(\S+)/m); if (m) return m[1].trim(); }
  return "DEMO_KEY";
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
/** Retries on network errors, 429 and 5xx (NASA services are sometimes down for a minute). */
export async function getRetry(url, tries = 6) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.ok) return res;
      last = new Error("HTTP " + res.status);
      if (res.status < 500 && res.status !== 429) throw last;
    } catch (e) { last = e; if (String(e.message).startsWith("HTTP 4") && !String(e.message).includes("429")) throw e; }
    console.log(`  attempt ${i}/${tries} failed (${last.message}), waiting ${i * 5}s...`);
    await sleep(i * 5000);
  }
  throw last;
}
