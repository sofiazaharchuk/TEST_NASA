import { Star, ExternalLink } from "lucide-react";
import { SOURCES } from "../data/sources.ts";
import { EXTRA_SOURCES } from "../data/sources.extra.ts";

export const btnPrimary = "btn-shine inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 text-lg font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";
export const btnGhost = "inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 text-base font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0";
export const glass = "rounded-2xl border border-white/10 bg-white/5 shadow-xl md:backdrop-blur-md";

export function Stars({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${label}: ${n}/3`}>
      {[1, 2, 3].map(i => <Star key={i} aria-hidden className={`h-5 w-5 ${i <= n ? "fill-amber-300 text-amber-300" : "text-slate-600"}`} />)}
    </span>
  );
}
export function SourceChip({ id, label }: { id: string; label: string }) {
  const s: { label: string; url: string; verify?: boolean } | undefined = [...SOURCES, ...EXTRA_SOURCES].find(x => x.id === id);
  if (!s) return null;
  const inner = <><ExternalLink aria-hidden className="h-3.5 w-3.5" />{label}: {s.label}{import.meta.env.DEV && s.verify ? " (verify!)" : ""}</>;
  const cls = "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200";
  return s.url ? <a className={cls} href={s.url} target="_blank" rel="noopener noreferrer">{inner}</a> : <span className={cls}>{inner}</span>;
}
