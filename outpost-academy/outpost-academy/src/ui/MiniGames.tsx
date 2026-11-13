import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Wind, Zap, Shield, Droplets, X } from "lucide-react";
import { btnPrimary, glass } from "./bits.tsx";
import type { Mini } from "../store.ts";

/** Three quick mini-games (about 10 seconds each). A win gives +1 energy block today; losing costs nothing. */
function Shell({ title, help, onClose, closeLabel, children }: { title: string; help: string; onClose: () => void; closeLabel: string; children?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label={title} className={`${glass} max-h-[92dvh] overscroll-contain w-full max-w-lg overflow-auto bg-slate-900/95 p-5`}>
        <div className="flex items-start gap-3">
          <h2 className="flex-1 font-head text-2xl font-extrabold">{title}</h2>
          <button aria-label={closeLabel} onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 hover:bg-white/10"><X aria-hidden /></button>
        </div>
        <p className="mt-1 text-slate-300" aria-live="polite">{help}</p>
        {children}
      </div>
    </div>
  );
}
export function MiniGame({ kind, onDone, onClose }: { kind: Mini; onDone: (win: boolean) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [res, setRes] = useState<boolean | null>(null);
  return (
    <Shell title={t(`mini.${kind}.title`)} help={res === null ? t(`mini.${kind}.help`) : t(res ? "mini.win" : "mini.lose")} onClose={onClose} closeLabel={t("mini.skip")}>
      {res === null
        ? kind === "tuner" ? <Tuner end={setRes} /> : kind === "sweep" ? <Sweep end={setRes} /> : <Memory end={setRes} />
        : <button autoFocus className={`${btnPrimary} mt-4 w-full`} onClick={() => onDone(res)}>{t("mini.continue")}</button>}
    </Shell>
  );
}
/** Timing game: stop the moving marker inside the green zone. 3 tries, the marker gets faster after each miss. */
function Tuner({ end }: { end: (w: boolean) => void }) {
  const { t } = useTranslation();
  const [pos, setPos] = useState(0), [tries, setTries] = useState(3);
  const dir = useRef(1), speed = useRef(1.2);
  useEffect(() => {
    const id = setInterval(() => setPos(p => { let n = p + dir.current * speed.current; if (n >= 100) { n = 100; dir.current = -1; } if (n <= 0) { n = 0; dir.current = 1; } return n; }), 20);
    return () => clearInterval(id);
  }, []);
  const stop = () => {
    if (pos >= 40 && pos <= 60) { end(true); return; }
    speed.current += 0.4; const left = tries - 1; setTries(left); if (left <= 0) end(false);
  };
  return (
    <div className="mt-4 space-y-4">
      <div className="relative h-14 overflow-hidden rounded-full bg-white/10" role="img" aria-label={t("mini.tuner.title")}>
        <div className="absolute inset-y-0 left-[40%] w-[20%] bg-emerald-400/40" />
        <div className="absolute top-0 h-full w-3 rounded bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,.9)]" style={{ left: `calc(${pos}% - 6px)` }} />
      </div>
      <p className="text-center text-sm text-slate-300">{t("mini.tries", { n: tries })}</p>
      <button className={`${btnPrimary} w-full`} onClick={stop}>{t("mini.stop")}</button>
    </div>
  );
}
/** Tap all the dust specks on the solar panel before the time runs out. */
function Sweep({ end }: { end: (w: boolean) => void }) {
  const { t } = useTranslation();
  const [specks, setSpecks] = useState(() => Array.from({ length: 6 }, (_, i) => ({ id: i, x: 6 + Math.random() * 80, y: 8 + Math.random() * 70 })));
  const [time, setTime] = useState(10);
  useEffect(() => { const id = setInterval(() => setTime(s => s - 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (specks.length === 0) end(true); else if (time <= 0) end(false); }, [specks, time, end]);
  return (
    <div className="mt-4 space-y-3">
      <div className="relative h-60 overflow-hidden rounded-xl border border-sky-300/40 bg-gradient-to-br from-sky-600 to-blue-900" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
        {specks.map(s => <button key={s.id} aria-label={t("mini.speck")} onClick={() => setSpecks(x => x.filter(y => y.id !== s.id))} className="absolute h-12 w-12 rounded-full bg-amber-700/90 shadow-[0_0_12px_rgba(120,53,15,.9)] transition-transform active:scale-75" style={{ left: `${s.x}%`, top: `${s.y}%` }} />)}
      </div>
      <p className="text-center text-sm text-slate-300">{t("mini.time", { n: Math.max(0, time) })} · {specks.length}</p>
    </div>
  );
}
const ICONS = [Wind, Zap, Shield, Droplets];
const shuffle = (a: number[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
/** Memory game: find the 4 pairs of base machines. */
function Memory({ end }: { end: (w: boolean) => void }) {
  const { t } = useTranslation();
  const [cards] = useState(() => shuffle([0, 1, 2, 3, 0, 1, 2, 3]));
  const [open, setOpen] = useState<number[]>([]), [done, setDone] = useState<number[]>([]);
  const flip = (i: number) => {
    if (open.length >= 2 || open.includes(i) || done.includes(i)) return;
    const n = [...open, i]; setOpen(n);
    if (n.length === 2) {
      const [a, b] = n;
      if (cards[a] === cards[b]) { const d = [...done, a, b]; setTimeout(() => { setDone(d); setOpen([]); if (d.length === 8) end(true); }, 500); }
      else setTimeout(() => setOpen([]), 800);
    }
  };
  return (
    <div className="mt-4 grid grid-cols-4 gap-2">
      {cards.map((c, i) => {
        const show = open.includes(i) || done.includes(i), Icon = ICONS[c];
        return <button key={i} aria-label={show ? String(c + 1) : t("mini.card")} onClick={() => flip(i)} className={`grid h-20 place-items-center rounded-xl border transition-all ${show ? "border-cyan-300 bg-cyan-400/15" : "border-white/20 bg-white/5 hover:bg-white/10"}`}>{show ? <Icon aria-hidden className="h-8 w-8 text-cyan-200" /> : <span aria-hidden className="text-2xl">?</span>}</button>;
      })}
    </div>
  );
}
