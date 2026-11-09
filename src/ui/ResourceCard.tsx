import { motion, useReducedMotion } from "framer-motion";
import { Wind, Zap, Shield, Sprout, Droplets, Plus, Minus, CheckCircle2, AlertTriangle, OctagonAlert } from "lucide-react";
import type { Res } from "../sim/types.ts";
import type { Status } from "../game/logic.ts";

const ICON = { air: Wind, power: Zap, shield: Shield, food: Sprout, water: Droplets } as const;
const GLOW: Record<Res, string> = { air: "shadow-[0_0_24px_rgba(34,211,238,.3)]", power: "shadow-[0_0_24px_rgba(251,191,36,.3)]", shield: "shadow-[0_0_24px_rgba(99,102,241,.35)]", food: "shadow-[0_0_24px_rgba(52,211,153,.3)]", water: "shadow-[0_0_24px_rgba(56,189,248,.3)]" };
const BAR: Record<Res, string> = { air: "from-cyan-400 to-blue-500", power: "from-amber-300 to-orange-500", shield: "from-indigo-400 to-violet-500", food: "from-emerald-300 to-green-500", water: "from-sky-300 to-blue-500" };
const BADGE = { ok: [CheckCircle2, "text-emerald-300 bg-emerald-400/10"], warn: [AlertTriangle, "text-amber-300 bg-amber-400/10"], danger: [OctagonAlert, "text-rose-300 bg-rose-400/10"] } as const;

interface Props {
  id: Res; label: string; hint: string; value: number; status: Status; statusText: string;
  blocks?: number; extra?: string; lessLabel?: string; moreLabel?: string; onChange?: (d: 1 | -1) => void;
}
export function ResourceCard({ id, label, hint, value, status, statusText, blocks, extra, lessLabel, moreLabel, onChange }: Props) {
  const reduce = useReducedMotion();
  const Icon = ICON[id], [Badge, badgeCls] = BADGE[status];
  const tap = reduce ? {} : { whileTap: { scale: 0.96 } };
  return (
    <motion.section initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} whileHover={reduce ? undefined : { y: -2 }}
      className={`rounded-2xl border border-white/10 bg-slate-900/80 p-4 transition-all md:backdrop-blur-md duration-200 hover:border-white/20 ${GLOW[id]}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10"><Icon aria-hidden className="h-6 w-6" /></div>
        <div className="min-w-[7rem] flex-1">
          <h3 className="font-head text-lg font-extrabold text-white">{label}</h3>
          <p className="text-sm text-slate-300">{hint}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badgeCls}`}><Badge aria-hidden className="h-3.5 w-3.5" />{statusText}</span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <motion.div className={`bar-shimmer h-full rounded-full bg-gradient-to-r ${BAR[id]}`} initial={false} animate={{ width: `${value}%` }} transition={{ duration: reduce ? 0 : 0.4 }} />
      </div>
      {onChange ? (
        <div className="mt-3 flex items-center gap-3"><div className="flex min-h-7 flex-1 flex-wrap gap-1" aria-hidden>{Array.from({ length: Math.max(0, blocks ?? 0) }, (_, i) => <span key={i} className="grid h-7 w-7 place-items-center rounded-md bg-amber-400 text-slate-900 shadow-[0_0_10px_rgba(251,191,36,.5)]"><Zap className="h-4 w-4" /></span>)}</div>
          <motion.button {...tap} aria-label={lessLabel} onClick={() => onChange(-1)} className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"><Minus aria-hidden /></motion.button>
          <span key={blocks} className="anim-pop min-w-10 text-center text-xl font-semibold" aria-live="polite">{blocks}</span>
          <motion.button {...tap} aria-label={moreLabel} onClick={() => onChange(1)} className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,.35)] hover:-translate-y-0.5"><Plus aria-hidden /></motion.button>
        </div>
      ) : extra ? <p className="mt-2 text-right text-sm text-amber-300">{extra}</p> : null}
    </motion.section>
  );
}
