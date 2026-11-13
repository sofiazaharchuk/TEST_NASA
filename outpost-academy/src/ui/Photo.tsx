import { useState } from "react";
import photos from "../data/photos.json";

interface Entry { file: string; title: string; credit: string }
const entries = photos as Record<string, Entry>;
/**
 * Real NASA photo with credit. If photos.json has no entry (for example it was overwritten) it still tries public/photos/<theme>.jpg and .png.
 * `fallbackTheme` is tried next (for example the level photo when a special photo is missing). If nothing loads: a gradient.
 */
export function Photo({ theme, fallbackTheme, className = "", overlay = true, credit = true, kenburns = false }: { theme: string; fallbackTheme?: string; className?: string; overlay?: boolean; credit?: boolean; kenburns?: boolean }) {
  const files = [theme, ...(fallbackTheme && fallbackTheme !== theme ? [fallbackTheme] : [])].flatMap(t => (entries[t] ? [entries[t].file] : [`${t}.jpg`, `${t}.png`]));
  const [i, setI] = useState(0);
  if (i >= files.length) return <div aria-hidden className={`bg-gradient-to-br from-indigo-900/70 to-cyan-900/40 ${className}`} />;
  const e = Object.values(entries).find(x => x.file === files[i]);
  return (
    <figure className={`overflow-hidden ${className}`}>
      <img src={`${import.meta.env.BASE_URL}photos/${files[i]}`} alt={e?.title ?? "NASA photo"} loading="lazy" decoding="async" onError={() => setI(i + 1)} className={`h-full w-full object-cover ${kenburns ? "anim-kenburns" : ""}`} />
      {overlay && <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />}
      {credit && <figcaption className="absolute right-2 top-1 text-[10px] text-slate-300/80">{e?.credit ?? "Credit: NASA"}</figcaption>}
    </figure>
  );
}
