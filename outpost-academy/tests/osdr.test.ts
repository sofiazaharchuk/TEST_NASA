import assert from "node:assert/strict";
import { parseOsdr, loadOsdr, osdrStudyUrl } from "../src/nasa/osdr.ts";
// Synthetic fixture in the Elasticsearch-style shape (NOT real studies; used only to test parsing).
const fx = { hits: { total: { value: 123 }, hits: [
  { _id: "OSD-1", _source: { "Study Title": "  Bone   test A " } }, { _id: "bad", _source: { title: "no id" } }, { _id: "OSD-2", _source: {} }, null,
  { _id: "OSD-3", _source: { title: "x".repeat(200) } }, { _id: "OSD-4", _source: { title: "B" } }, { _id: "OSD-5", _source: { title: "C" } }] } };
const d = parseOsdr(fx, "bone")!;
assert.equal(d.total, 123); assert.equal(d.studies.length, 3, "only 3 studies, malformed rows dropped");
assert.equal(d.studies[0].title, "Bone test A"); assert.ok(d.studies[1].title.length <= 140);
assert.equal(parseOsdr({ hits: { total: 7, hits: [] } }, "bone")?.total, 7);
for (const bad of [null, [], {}, { hits: {} }, { hits: { total: "many" } }, { hits: { total: -1 } }]) assert.equal(parseOsdr(bad, "bone"), null, "unexpected shapes give null");
assert.equal(osdrStudyUrl("OSD-1"), "https://osdr.nasa.gov/bio/repo/data/studies/OSD-1");
const ok = { ok: true, json: async () => fx } as unknown as Response, boom = async () => { throw new Error("offline"); };
const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const kv = mem();
assert.equal((await loadOsdr({ fetcher: async () => ok, storage: kv, now: 1000 })).source, "live");
assert.equal((await loadOsdr({ fetcher: boom as any, storage: kv, now: 1000 + 60_000 })).source, "live", "fresh cache is used");
const old = await loadOsdr({ fetcher: boom as any, storage: kv, now: 1000 + 48 * 3600_000 });
assert.equal(old.source, "archive"); assert.equal(old.data?.total, 123);
assert.equal((await loadOsdr({ fetcher: boom as any, storage: mem() })).source, "none");
assert.equal((await loadOsdr({ fetcher: async () => ({ ok: true, json: async () => ({ hits: {} }) }) as unknown as Response, storage: mem() })).source, "none", "wrong shape is never shown as live");
// photos: every theme in the game must be a known downloader theme, and no two places share a theme by accident
import { readFileSync } from "node:fs";
import { LEVEL_THEME } from "../src/data/themes.ts";
import { FACTS } from "../src/data/facts.ts";
const dl = readFileSync(new URL("../tools/download_photos.mjs", import.meta.url), "utf8");
const themes = new Set([...dl.matchAll(/^\s+([a-z_]+): \[/gm)].map(m => m[1]));
const used = [...Object.values(LEVEL_THEME), ...FACTS.map(f => f.theme)];
for (const t of used) assert.ok(themes.has(t), `photo theme ${t} must exist in tools/download_photos.mjs`);
assert.equal(new Set(used).size, used.length, "levels and facts never share a photo theme");
for (const t of ["solar_storm", "moon_night", "s_apollo", "s_earth", "s_sun", "s_mars", "s_iss", "s_nebula"]) assert.ok(themes.has(t), t);
console.log("osdr + photo theme tests passed");
