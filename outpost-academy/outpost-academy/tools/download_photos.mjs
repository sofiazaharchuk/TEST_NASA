// Downloads real NASA photos (with credits) from the NASA Image and Video Library. Needs internet, no API key.
// Run:  npm run photos      Then check each photo's page (link in src/data/photos.json) for its credit and usage terms.
import { mkdirSync, writeFileSync } from "node:fs";
import { getRetry } from "./_net.mjs";
const API = "https://images-api.nasa.gov";
const THEMES = {
  moon: "Artemis moon south pole",
  earth: "Earth rising over the Moon",
  solar: "solar flare Solar Dynamics Observatory",
  veggie: "Veggie lettuce space station astronaut",
  iss_water: "astronaut water bubble International Space Station",
  mars: "Perseverance Mars rover",
  iss_cabin: "astronaut inside International Space Station laboratory",
  moxie: "MOXIE Perseverance oxygen experiment",
  dsn: "Deep Space Network antenna Goldstone",
  aurora: "aurora seen from International Space Station",
  artemis: "Artemis lunar lander astronauts moon surface",
  solar_panels: "International Space Station solar arrays",
};
mkdirSync("public/photos", { recursive: true });
import { existsSync, readFileSync } from "node:fs";
const FILE = "src/data/photos.json";
const out = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8") || "{}") : {}; // keep earlier photos; a failed run must never erase them
for (const [theme, q] of Object.entries(THEMES)) {
  try {
    const s = await (await getRetry(`${API}/search?q=${encodeURIComponent(q)}&media_type=image`)).json();
    if (out[theme]) { console.log("keep", theme); continue; }
    for (const it of (s.collection?.items ?? []).slice(0, 12)) {
      const d = it.data?.[0]; if (!d?.nasa_id) continue;
      const a = await (await getRetry(`${API}/asset/${encodeURIComponent(d.nasa_id)}`)).json();
      const urls = (a.collection?.items ?? []).map(x => x.href).filter(h => /\.(jpe?g|png)$/i.test(h));
      const pick = urls.find(h => h.includes("~medium")) || urls.find(h => h.includes("~large")) || urls.find(h => h.includes("~small")) || urls[0];
      if (!pick) continue;
      const img = await getRetry(pick.replace("http://", "https://"));
      const file = `${theme}.${pick.match(/\.(jpe?g|png)$/i)[1].toLowerCase()}`;
      writeFileSync(`public/photos/${file}`, Buffer.from(await img.arrayBuffer()));
      out[theme] = { file, title: d.title, credit: `Credit: ${d.photographer || d.secondary_creator || "NASA"} / ${d.center || "NASA"}`, nasa_id: d.nasa_id, link: `https://images.nasa.gov/details/${d.nasa_id}` };
      console.log("ok  ", theme, "-", d.title); break;
    }
    if (!out[theme]) console.log("none", theme);
  } catch (e) { console.log("fail", theme, String(e)); }
}
writeFileSync(FILE, JSON.stringify(out, null, 2));
console.log("Saved", Object.keys(out).length, "photos. Restart `npm run dev` if it is running.");
