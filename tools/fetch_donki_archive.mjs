// Run WITH internet:  npm run archive   (reads VITE_NASA_API_KEY from .env, or NASA_API_KEY from the environment)
// Saves real DONKI flare records so the game can show an honest "Archive" badge when NASA is offline.
import { writeFileSync } from "node:fs";
import { nasaKey, getRetry } from "./_net.mjs";
const key = nasaKey(), d = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
console.log(key === "DEMO_KEY" ? "No key found: using DEMO_KEY (limited). Put VITE_NASA_API_KEY=... in .env" : "Using your NASA key");
const res = await getRetry(`https://api.nasa.gov/DONKI/FLR?startDate=${d(365)}&endDate=${d(0)}&api_key=${key}`);
const text = await res.text(), events = text.trim() ? JSON.parse(text) : [];
if (!Array.isArray(events) || events.length === 0) throw new Error("DONKI returned no flares; keeping the old archive");
writeFileSync("src/data/donkiArchive.json", JSON.stringify({ fetchedAt: new Date().toISOString(), events }, null, 1));
console.log("saved", events.length, "flares");
