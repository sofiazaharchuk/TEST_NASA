// Downloads real NASA photos (with credits) from the NASA Image and Video Library. Needs internet, no API key.
// Run:  npm run photos            (keeps good photos, fixes duplicates and missing files, adds new themes)
//       npm run photos -- --force (downloads everything again)
// Every theme gets its OWN picture: a photo already used by another theme (same NASA id or same title) is skipped.
import { mkdirSync, writeFileSync, existsSync, readFileSync, unlinkSync } from "node:fs";
import { getRetry } from "./_net.mjs";
const API = "https://images-api.nasa.gov";
const FORCE = process.argv.includes("--force");
// theme -> list of search queries (tried in order until a photo nobody else uses is found)
const THEMES = {
  // levels
  moon: ["Artemis moon south pole", "Artemis astronaut Moon surface"],
  earth: ["Earth rising over the Moon", "Earthrise Apollo 8"],
  solar: ["solar flare Solar Dynamics Observatory", "Sun X-class flare SDO"],
  veggie: ["Veggie lettuce space station astronaut", "astronaut harvests lettuce space station"],
  iss_water: ["astronaut water bubble International Space Station", "water droplet floating space station"],
  mars: ["Perseverance Mars rover selfie", "Perseverance rover Jezero crater"],
  mars_dust: ["Mars dust storm", "Mars global dust storm Hubble"],
  mars_garden: ["Mars Dune Alpha CHAPEA habitat", "Mars habitat greenhouse concept", "Mars outpost concept NASA"],
  // in-game scenes
  solar_storm: ["coronal mass ejection SOHO", "coronal mass ejection Sun eruption"],
  moon_night: ["Moon surface Apollo lunar night", "lunar surface astronaut footprint"],
  // facts
  iss_cabin: ["astronaut inside International Space Station laboratory", "ISS Destiny laboratory astronaut working"],
  iss_exercise: ["astronaut exercise ARED International Space Station", "astronaut treadmill COLBERT space station"],
  food_space: ["astronaut eating food International Space Station", "space food tray astronaut meal"],
  solar_panels: ["International Space Station solar arrays", "ISS solar array Earth"],
  mars_orbit: ["Mars Reconnaissance Orbiter HiRISE Mars", "Jezero crater delta orbiter"],
  mars_storm: ["Mars dust storm Opportunity rover sky", "Curiosity Mars dust haze"],
  moxie: ["MOXIE Perseverance oxygen experiment", "MOXIE Mars oxygen"],
  dsn: ["Deep Space Network antenna Goldstone", "Deep Space Network dish Canberra"],
  mars_sunset: ["Curiosity Mars sunset", "Mars sunset Spirit rover"],
  // start screen slideshow (own pictures, so the title never shows a level photo twice)
  s_apollo: ["Apollo 17 astronaut Moon rover", "Apollo 11 astronaut footprint Moon"],
  s_earth: ["Blue Marble Earth full disk", "Earth from space whole planet"],
  s_sun: ["Sun corona total solar eclipse", "Sun ultraviolet Solar Dynamics Observatory"],
  s_mars: ["Curiosity rover selfie Mars", "Mars Ingenuity helicopter"],
  s_iss: ["International Space Station over Earth", "ISS seen from Space Shuttle"],
  s_nebula: ["James Webb Space Telescope nebula", "Hubble nebula"],
  aurora: ["aurora seen from International Space Station"],
  artemis: ["Artemis lunar lander astronauts moon surface"],
};
mkdirSync("public/photos", { recursive: true });
const FILE = "src/data/photos.json";
const prev = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8") || "{}") : {};
const out = {}, usedIds = new Set(), usedTitles = new Set();
const norm = s => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// 1) keep earlier photos that are fine: file exists and nobody else uses the same picture. Duplicates are dropped and fetched again.
for (const [theme, e] of Object.entries(prev)) {
  if (FORCE || !THEMES[theme]) continue;
  const ok = e?.file && existsSync(`public/photos/${e.file}`) && !usedIds.has(e.nasa_id) && !usedTitles.has(norm(e.title));
  if (!ok) { console.log("redo", theme, e?.file ? "(duplicate or missing file)" : ""); continue; }
  out[theme] = e; usedIds.add(e.nasa_id); usedTitles.add(norm(e.title));
}
// 2) find a photo for every theme that has none
for (const [theme, queries] of Object.entries(THEMES)) {
  if (out[theme]) { console.log("keep", theme); continue; }
  try {
    search: for (const q of queries) {
      const s = await (await getRetry(`${API}/search?q=${encodeURIComponent(q)}&media_type=image`)).json();
      for (const it of (s.collection?.items ?? []).slice(0, 25)) {
        const d = it.data?.[0]; if (!d?.nasa_id || usedIds.has(d.nasa_id) || usedTitles.has(norm(d.title))) continue;
        const a = await (await getRetry(`${API}/asset/${encodeURIComponent(d.nasa_id)}`)).json();
        const urls = (a.collection?.items ?? []).map(x => x.href).filter(h => /\.(jpe?g|png)$/i.test(h));
        const pick = urls.find(h => h.includes("~medium")) || urls.find(h => h.includes("~large")) || urls.find(h => h.includes("~small")) || urls[0];
        if (!pick) continue;
        const img = await getRetry(pick.replace("http://", "https://"));
        const file = `${theme}.${pick.match(/\.(jpe?g|png)$/i)[1].toLowerCase()}`;
        for (const ext of ["jpg", "png"]) { const old = `public/photos/${theme}.${ext}`; if (old !== `public/photos/${file}` && existsSync(old)) unlinkSync(old); }
        writeFileSync(`public/photos/${file}`, Buffer.from(await img.arrayBuffer()));
        out[theme] = { file, title: d.title, credit: `Credit: ${d.photographer || d.secondary_creator || "NASA"} / ${d.center || "NASA"}`, nasa_id: d.nasa_id, link: `https://images.nasa.gov/details/${d.nasa_id}` };
        usedIds.add(d.nasa_id); usedTitles.add(norm(d.title));
        console.log("ok  ", theme, "-", d.title); break search;
      }
    }
    if (!out[theme]) console.log("none", theme);
  } catch (e) { console.log("fail", theme, String(e)); }
  writeFileSync(FILE, JSON.stringify(out, null, 2)); // save after every theme: an interrupted run loses nothing
}
writeFileSync(FILE, JSON.stringify(out, null, 2));
const missing = Object.keys(THEMES).filter(t => !out[t]);
console.log("Saved", Object.keys(out).length, "photos, all different.", missing.length ? "Missing (run again): " + missing.join(", ") : "Nothing missing.");
