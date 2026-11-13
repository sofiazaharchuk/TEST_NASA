import assert from "node:assert/strict";
import { parseFlares, strongest, weatherOf, loadFlares } from "../src/nasa/donki.ts";
import { parseApod, loadApod } from "../src/nasa/apod.ts";
import { LEVELS } from "../src/data/levels.ts";
import { newGame, playDay } from "../src/sim/engine.ts";
// Synthetic fixture in the DONKI FLR shape (NOT real events; used only to test parsing).
const fx = [{ flrID: "a", classType: "C2.1", beginTime: "2026-01-01T00:00Z" }, { flrID: "b", classType: "M5.0", beginTime: "2026-01-02T00:00Z" }, { classType: "bad", beginTime: "x" }, null, { classType: "X1.0" }];
const f = parseFlares(fx);
assert.equal(f.length, 2, "malformed records are dropped");
assert.equal(strongest(f)?.classType, "M5.0");
assert.equal(weatherOf(strongest(f)), "minor");
assert.equal(weatherOf(strongest(parseFlares([{ classType: "X9.0", beginTime: "t" }]))), "strong");
assert.equal(weatherOf(null), "calm");
const ok = { ok: true, text: async () => JSON.stringify(fx) } as unknown as Response;
assert.equal((await loadFlares({ fetcher: async () => ok })).source, "live");
const boom = async () => { throw new Error("offline"); };
assert.equal((await loadFlares({ fetcher: boom as any, archive: { fetchedAt: "t", events: fx } })).source, "archive");
assert.equal((await loadFlares({ fetcher: boom as any, archive: { fetchedAt: null, events: [] } })).source, "none");
// Same plan, stronger real storm: a stronger shield is required (80 is enough in normal weather, not in strong).
const l = LEVELS[2], run = (w: "minor" | "strong") => { let s = newGame(l); while (!s.over) s = playDay(l, s, { alloc: { air: 2, shield: s.day === 5 ? 2 : 0 } }, w); return s.hearts; };
assert.ok(run("strong") < run("minor"), "strong weather hurts more");
// Cache: a fresh cached answer saves an API call; an old cache is honestly labelled "archive" when NASA is unreachable.
const mem = new Map<string, string>(), kv = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
let calls = 0; const counting = async () => { calls++; return ok; };
const t0 = Date.now();
assert.equal((await loadFlares({ fetcher: counting as any, storage: kv, now: t0 })).source, "live");
assert.equal((await loadFlares({ fetcher: counting as any, storage: kv, now: t0 + 60_000 })).source, "live");
assert.equal(calls, 1, "second call within 30 minutes uses the cache");
const old = await loadFlares({ fetcher: boom as any, storage: kv, now: t0 + 3 * 3600_000 });
assert.equal(old.source, "archive"); assert.match(old.error ?? "", /offline/);
const empty = { ok: true, text: async () => "" } as unknown as Response;
assert.equal((await loadFlares({ fetcher: (async () => empty) as any })).flares.length, 0, "empty DONKI body means no flares, not an error");
const limited = { ok: false, status: 429 } as unknown as Response;
assert.match((await loadFlares({ fetcher: (async () => limited) as any })).error ?? "", /429/);
// Fallback chain: an empty or unreadable saved archive must not hide the built-in list; an empty key falls back to DEMO_KEY.
const fb = await loadFlares({ fetcher: boom as any, archive: { fetchedAt: null, events: [{ junk: 1 }] }, fallback: { fetchedAt: null, events: [{ flrID: "k", classType: "X9.0", beginTime: "2024-10-03" }] } });
assert.equal(fb.source, "archive"); assert.equal(fb.builtin, true); assert.equal(weatherOf(strongest(fb.flares)), "strong");
assert.equal((await loadFlares({ fetcher: boom as any, archive: { fetchedAt: "t", events: fx }, fallback: { fetchedAt: null, events: [] } })).builtin, undefined, "saved archive wins over the built-in list");
const urls: string[] = []; await loadFlares({ key: "  ", fetcher: (async (u: string) => { urls.push(u); if (urls.length === 1) throw new Error("blocked"); return ok; }) as any });
assert.match(urls[0], /ccmc\.gsfc\.nasa\.gov\/DONKI-API\/get\/FLR/, "the new CCMC address is tried first");
assert.match(urls[1], /api_key=DEMO_KEY/, "the old api.nasa.gov address is the second try");
// APOD: only still https images are accepted; cache and honest labels like DONKI.
const img = { media_type: "image", title: "A nebula", date: "2026-11-13", url: "https://apod.nasa.gov/apod/image/x.jpg" };
assert.equal(parseApod(img)?.title, "A nebula");
assert.equal(parseApod({ ...img, copyright: "Some Person" }), null, "pictures owned by other people are not shown");
assert.equal(parseApod({ ...img, title: "NASA Science" }), null, "placeholders are skipped");
assert.equal(parseApod({ ...img, media_type: "video" }), null, "videos are skipped");
assert.equal(parseApod({ ...img, url: "http://insecure/x.jpg" }), null, "only https");
assert.equal(parseApod(null), null);
const am = new Map<string, string>(), akv = { getItem: (k: string) => am.get(k) ?? null, setItem: (k: string, v: string) => void am.set(k, v) };
let ac = 0; const aok = async () => { ac++; return { ok: true, json: async () => img } as unknown as Response; };
assert.equal((await loadApod({ fetcher: aok as any, storage: akv, now: t0 })).source, "live");
assert.equal((await loadApod({ fetcher: aok as any, storage: akv, now: t0 + 1000 })).source, "live"); assert.equal(ac, 1, "fresh cache saves a request");
const ao = await loadApod({ fetcher: boom as any, storage: akv, now: t0 + 9 * 3600_000 });
assert.equal(ao.source, "archive"); assert.equal(ao.apod?.title, "A nebula");
assert.equal((await loadApod({ fetcher: boom as any })).source, "none");
console.log("all donki tests passed");
