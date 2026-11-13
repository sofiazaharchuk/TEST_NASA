// Run WITH internet:  npm run archive   (no key needed: DONKI now lives on ccmc.gsfc.nasa.gov)
// Saves real DONKI flare records so the game can show an honest "Archive" badge when NASA is offline.
import { writeFileSync } from "node:fs";
import { getRetry } from "./_net.mjs";
const d = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
// New CCMC address (no key). It accepts at most 60 days per request, so a year is fetched in chunks.
const events = [];
for (let end = 0; end < 365; end += 60) {
  const url = `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR?startDate=${d(Math.min(end + 59, 365))}&endDate=${d(end)}`;
  const text = await (await getRetry(url)).text();
  const part = text.trim() ? JSON.parse(text) : [];
  if (Array.isArray(part)) events.push(...part);
  console.log(`  days ${end}-${end + 59}: ${Array.isArray(part) ? part.length : 0} flares`);
}
if (!Array.isArray(events) || events.length === 0) throw new Error("DONKI returned no flares; keeping the old archive");
writeFileSync("src/data/donkiArchive.json", JSON.stringify({ fetchedAt: new Date().toISOString(), events }, null, 1));
console.log("saved", events.length, "flares");
