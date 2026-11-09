import type { Status } from "../game/logic.ts";
const TONE: Record<Status, string> = { ok: "#34d399", warn: "#fbbf24", danger: "#fb7185" };
/** Round gauge for the big picture: the ring fills with the value and changes colour with the status. */
export function Gauge({ value, label, status }: { value: number; label: string; status: Status }) {
  const r = 20, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-950/70 p-2 pr-3 backdrop-blur" role="img" aria-label={`${label}: ${Math.round(v)}%`}>
      <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0 -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="5" />
        <circle cx="24" cy="24" r={r} fill="none" stroke={TONE[status]} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} style={{ transition: "stroke-dashoffset .6s ease, stroke .3s" }} />
      </svg>
      <div className="min-w-0 leading-tight"><p className="truncate text-[11px] text-slate-300 sm:text-xs">{label}</p><p className="font-head text-base font-extrabold sm:text-lg">{Math.round(v)}%</p></div>
    </div>
  );
}
