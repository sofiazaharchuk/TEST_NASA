import { useState } from "react";
import photos from "../data/photos.json";

interface Entry { file: string; title: string; credit: string }
/**
 * Real NASA photo with credit. If photos.json has no entry (for example it was overwritten), it still tries public/photos/<theme>.jpg and .png.
 * If nothing loads it quietly falls back to a gradient. The caller sets position/size classes.
 */
export function Photo({ theme, className = "", overlay = true, credit = true, kenburns = false }: { theme: string; className?: string; overlay?: boolean; credit?: boolean; kenburns?: boolean }) {
  const p = (photos as Record<string, Entry>)[theme];
  const files = p ? [p.file] : [`${theme}.jpg`, `${theme}.png`];
  const [i, setI] = useState(0);
  if (i >= files.length) return <div aria-hidden className={`bg-gradient-to-br from-indigo-900/70 to-cyan-900/40 ${className}`} />;
  return (
    <figure className={`overflow-hidden ${className}`}>
      <img src={`${import.meta.env.BASE_URL}photos/${files[i]}`} alt={p?.title ?? "NASA photo"} loading="lazy" decoding="async" onError={() => setI(i + 1)} className={`h-full w-full object-cover ${kenburns ? "anim-kenburns" : ""}`} />
      {overlay && <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />}
      {credit && <figcaption className="absolute right-2 top-1 text-[10px] text-slate-300/80">{p?.credit ?? "Credit: NASA"}</figcaption>}
    </figure>
  );
}
