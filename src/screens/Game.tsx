import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, FlaskConical, ShieldPlus, Bot, AlertTriangle, ArrowRight, Info, Gamepad2, Radio, Zap, Shield, Wind, Moon, Sun, ArrowUp, ArrowDown, Minus, Users, Sparkles, HeartPulse, CheckCircle2, Circle } from "lucide-react";
import { LEVELS } from "../data/levels.ts";
import { LEVEL_THEME } from "../data/themes.ts";
import { useStore } from "../store.ts";
import { DECISIONS } from "../game/decisions.ts";
import { blocksLeft, forecast, projectedShield, statusFor, taskDone } from "../game/logic.ts";
import { blocksToday, stormThresholds } from "../sim/engine.ts";
import { ResourceCard } from "../ui/ResourceCard.tsx";
import { CoPilot, type Q } from "../ui/CoPilot.tsx";
import { WeatherFx } from "../ui/WeatherFx.tsx";
import { MiniGame } from "../ui/MiniGames.tsx";
import { Photo } from "../ui/Photo.tsx";
import { Gauge } from "../ui/Gauge.tsx";
import { btnPrimary, btnGhost, glass } from "../ui/bits.tsx";
import type { Level, Res, State } from "../sim/types.ts";

const HINT: Record<string, string> = { air: "airHint", shield: "shieldHint", food: "foodHint", water: "waterHint" };

export default function Game() {
  const { t } = useTranslation();
  const { levelIdx, weather, weatherSrc, replay, game: g, report, alloc, acts, notice, settings, setSettings, mini, miniDone, openMini, finishMini, closeMini, pending, choose, answerQuiz, closePending, adjust, toggle, endDay, closeReport } = useStore();
  const [help, setHelp] = useState(levelIdx === 0 && g?.day === 1);
  if (!g) return null;
  const l = LEVELS[levelIdx], fc = forecast(l, g);
  const left = blocksLeft(l, g, alloc, acts), total = blocksToday(l, g);
  const bat = Math.min(l.cap, Math.max(0, left)), waste = Math.max(0, left - l.cap), shield = projectedShield(g, alloc);
  const airLow = (alloc.air ?? 0) < 2, stormSoon = fc?.type === "storm" && !fc.today;
  const hint = airLow ? t("game.hint.air") : waste > 0 ? t("game.hint.wasted", { n: waste })
    : stormSoon && shield < stormThresholds(weather)[0] ? t("game.hint.shieldLow", { v: shield }) : stormSoon ? t("game.hint.stormWarn") : t("game.hint.ok");
  const q: Q = airLow ? "air" : waste > 0 ? "waste" : stormSoon ? "storm" : fc?.type === "micro" && !fc.today ? "micro" : "ok";
  const showCoach = levelIdx === 0 || g.day === 1;
  const coach = [{ done: (alloc.air ?? 0) >= 2, text: t("coach.air") }, { done: (alloc.shield ?? 0) > 0, text: t("coach.shield") }, { done: false, text: t("coach.end") }];
  const nextIdx = coach.findIndex(c => !c.done), ready = coach[0].done && coach[1].done;
  const value = (r: Res) => (r === "shield" ? shield : g.stock[r]);
  const night = l.income[g.day - 1] === 0, base = LEVEL_THEME[l.id];
  // The big picture follows what is happening: storm -> the Sun, lunar night -> Earth in the dark sky.
  const heroTheme = fc?.type === "storm" ? "solar" : night ? (base === "earth" ? "moon" : "earth") : base;
  const vitals = l.res.filter(r => r !== "power");
  const step = showCoach && nextIdx >= 0 ? coach[nextIdx].text : notice ? t(notice) : hint;
  return (
    <div className="space-y-4 pb-32">
      {/* 1. Where am I: slim mission bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wider text-cyan-300">{t(`levels.${l.id}.name`)}</p>
          <h1 className="font-head text-xl font-extrabold sm:text-2xl">{t("game.day", { day: g.day, total: l.days })}</h1>
          <div className="mt-1.5 flex max-w-xs gap-1" aria-hidden>{Array.from({ length: l.days }, (_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < g.day ? "bg-cyan-400" : "bg-white/20"}`} />)}</div>
        </div>
        <span className="inline-flex items-center gap-1" role="img" aria-label={t("game.crew", { n: g.hearts })}>
          {[0, 1, 2, 3].map(i => <Heart key={i} aria-hidden className={`h-6 w-6 sm:h-7 sm:w-7 ${i < g.hearts ? "anim-beat fill-rose-400 text-rose-400" : "text-slate-600"}`} />)}
        </span>
        <button className={`grid h-11 w-11 place-items-center rounded-xl border bg-slate-950/50 hover:bg-white/10 ${settings.together ? "border-indigo-400" : "border-white/20"}`} aria-pressed={settings.together} aria-label={t("common.together")} title={t("common.together")} onClick={() => setSettings({ together: !settings.together })}><Users aria-hidden /></button>
        <button className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-slate-950/50 hover:bg-white/10" aria-pressed={help} aria-label={t("game.help")} title={t("game.help")} onClick={() => setHelp(!help)}><Info aria-hidden /></button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        {/* LEFT: look here first. The picture, the vitals, then ONE instruction */}
        <div className="min-w-0 space-y-3 lg:sticky lg:top-4">
          <div className="on-photo relative h-72 overflow-hidden rounded-3xl border border-white/10 sm:h-96 lg:h-[30rem]" role="group" aria-label={t("scene.label", { s: Math.round(shield), a: Math.round(g.stock.air), h: g.hearts })}>
            <AnimatePresence initial={false}>
              <motion.div key={heroTheme} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
                <Photo theme={heroTheme} className="absolute inset-0" overlay kenburns />
              </motion.div>
            </AnimatePresence>
            <WeatherFx kind={fc?.type ?? null} today={!!fc?.today} night={night} shieldOk={shield >= stormThresholds(weather)[0]} animate={!settings.reduceMotion} />
            {fc && <span className={`absolute left-3 top-3 inline-flex max-w-[80%] items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-950 shadow-lg ${fc.today ? "animate-pulse" : ""}`}><AlertTriangle aria-hidden className="h-4 w-4 shrink-0" />{t(`game.forecast.${fc.type}.${fc.today ? "today" : "tomorrow"}`)}</span>}
            <span className="absolute bottom-[5.75rem] left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/70 px-3 py-1 text-xs backdrop-blur sm:bottom-[4.75rem] sm:text-sm">{night ? <><Moon aria-hidden className="h-4 w-4 text-slate-300" />{t("scene.night")}</> : <><Sun aria-hidden className="h-4 w-4 text-amber-300" />{t("scene.day")}</>}</span>
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
              {vitals.map(r => <Gauge key={r} value={value(r)} label={t(`game.${r}`)} status={statusFor(r, g, alloc, weather)} />)}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 p-4 shadow-[0_0_30px_rgba(6,182,212,.25)]" aria-live="polite">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400/20"><Bot aria-hidden className="h-7 w-7 text-cyan-200" /></span>
            <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-cyan-300">{t("game.step")}</p><p className="text-lg font-semibold leading-snug sm:text-xl">{step}</p></div>
            {showCoach && <ol className="flex shrink-0 gap-1" aria-hidden>{coach.map((c, i) => <li key={i} className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${c.done ? "bg-emerald-400 text-slate-900" : i === nextIdx ? "bg-cyan-300 text-slate-900" : "bg-white/15"}`}>{c.done ? "✓" : i + 1}</li>)}</ol>}
          </div>
          {help && (
            <section className={`${glass} p-4`} aria-label={t("game.howTo.title")}>
              <h2 className="font-head text-lg font-extrabold">{t("game.howTo.title")}</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-200"><li>{t("game.howTo.s1")}</li><li>{t("game.howTo.s2")}</li><li>{t("game.howTo.s3")}</li></ol>
              <button className={`${btnGhost} mt-3`} onClick={() => setHelp(false)}>{t("game.howTo.close")}</button>
            </section>
          )}
          <ul className="flex flex-wrap gap-2" aria-label={t("tasks.title")}>
            {l.tasks.map(k => { const ok = taskDone(k, g); return <li key={k.id} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${ok ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-white/5 text-slate-200"}`}>{ok ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : <Circle aria-hidden className="h-4 w-4 text-slate-500" />}{t(`tasks.${k.kind}`, { n: k.n })}</li>; })}
          </ul>
          <div className="flex flex-wrap gap-2 empty:hidden">
            {replay && <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/15 px-3 py-1.5 text-sm text-violet-200"><Zap aria-hidden className="h-4 w-4" />{t("replay.chip", { c: replay.split(" · ")[0], d: replay.split(" · ")[1] })}</span>}
            {!replay && weatherSrc && l.events.some(e => e.type === "storm") && <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-300">{t("spaceWeather.chip", { w: t(`spaceWeather.name.${weather}`), src: t(`spaceWeather.${weatherSrc}`) })}</span>}
          </div>
          {settings.together && <CoPilot levelId={l.id} q={q} />}
        </div>
        {/* RIGHT: do here. Energy -> machines -> extra actions */}
        <div className="min-w-0 space-y-3">
          <section className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4" aria-label={t("game.energyTitle")}>
            <div className="flex items-baseline justify-between gap-2"><h2 className="font-head text-lg font-extrabold text-amber-200">{t("game.energyTitle")}</h2><p className="text-amber-200"><b className="font-head text-3xl">{left}</b> / {total}</p></div>
            <div className="mt-2 flex flex-wrap gap-1.5" role="img" aria-label={t("game.blocks", { free: left, total })}>
              {Array.from({ length: total }, (_, i) => <span key={i} className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${i < left ? "bg-amber-400 text-slate-900 shadow-[0_0_14px_rgba(251,191,36,.6)]" : "bg-white/10 text-slate-500"}`}><Zap aria-hidden className="h-4 w-4" /></span>)}
            </div>
          </section>
          <h2 className="px-1 pt-2 font-head text-lg font-extrabold">{t("game.machines")}</h2>
          <div className="grid gap-3">
            {vitals.map(r => (
              <ResourceCard key={r} id={r} label={t(`game.${r}`)} hint={t(`game.${HINT[r]}`)} value={value(r)} blocks={alloc[r] ?? 0}
                status={statusFor(r, g, alloc, weather)} statusText={t(`game.status.${statusFor(r, g, alloc, weather)}`)}
                lessLabel={t("game.less", { name: t(`game.${r}`) })} moreLabel={t("game.more", { name: t(`game.${r}`) })} onChange={d => adjust(r, d)} />
            ))}
            <ResourceCard id="power" label={t("game.battery")} hint={t("game.batteryHint", { cap: l.cap })} value={Math.round((bat / l.cap) * 100)}
              status={waste > 0 ? "warn" : "ok"} statusText={`${bat} / ${l.cap}`} extra={waste > 0 ? t("game.wasted", { n: waste }) : undefined} />
          </div>
          <h2 className="px-1 pt-2 font-head text-lg font-extrabold">{t("game.extra")}</h2>
          <p className="-mt-2 px-1 text-sm text-slate-300">{t("game.extraHint")}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {!miniDone && <button onClick={openMini} className="inline-flex min-h-14 w-full items-center gap-2 rounded-2xl border border-amber-400/50 bg-amber-400/15 px-4 text-left font-semibold text-amber-100 transition-all hover:-translate-y-0.5"><Gamepad2 aria-hidden />{t("mini.play")}</button>}
            {l.science && <Toggle on={acts.science} onClick={() => toggle("science")} icon={<FlaskConical aria-hidden />} text={t("game.science")} />}
            {l.science && l.extras.includes("drone") && <Toggle on={acts.drone} onClick={() => toggle("drone")} icon={<Bot aria-hidden />} text={t("game.drone")} />}
            {l.extras.includes("radio") && <Toggle on={acts.radio} onClick={() => toggle("radio")} icon={<Radio aria-hidden />} text={t("game.radio")} />}
            {l.extras.includes("clean") && <Toggle on={acts.clean} onClick={() => toggle("clean")} icon={<Sparkles aria-hidden />} text={t("game.clean")} />}
            {l.extras.includes("rest") && <Toggle on={acts.rest} onClick={() => toggle("rest")} icon={<HeartPulse aria-hidden />} text={t("game.rest")} />}
            {fc?.type === "storm" && fc.today && <Toggle on={acts.shelter} onClick={() => toggle("shelter")} icon={<ShieldPlus aria-hidden />} text={t("game.shelter")} />}
          </div>
        </div>
      </div>
      {/* 3. Always-visible bar: energy left + the one big button */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <p className="flex shrink-0 items-center gap-2 font-semibold text-amber-300"><Zap aria-hidden className="h-5 w-5" /><span><b className="font-head text-2xl">{left}</b><span className="max-sm:sr-only"> {t("game.leftLabel")}</span></span></p>
          <motion.button whileTap={{ scale: 0.98 }} className={`${btnPrimary} flex-1 ${showCoach && ready && !settings.reduceMotion ? "animate-pulse" : ""}`} onClick={endDay}>{t("common.endDay")}<ArrowRight aria-hidden /></motion.button>
        </div>
      </div>
      {mini && <MiniGame kind={mini} onDone={finishMini} onClose={closeMini} />}
      {!report && pending?.kind === "decision" && <DecisionModal id={pending.d.id} onPick={choose} />}
      {!report && pending?.kind === "quiz" && <QuizModal id={pending.q.id} answer={pending.q.answer} onAnswer={answerQuiz} onClose={closePending} />}
      {report && <DayReport before={report.before} after={report.after} level={l} onClose={closeReport} />}
    </div>
  );
}

function Toggle({ on, onClick, icon, text }: { on: boolean; onClick: () => void; icon: ReactNode; text: string }) {
  return <button aria-pressed={on} onClick={onClick} className={`inline-flex min-h-14 w-full items-center gap-2 rounded-2xl border px-4 text-left transition-all hover:-translate-y-0.5 ${on ? "border-emerald-400 bg-emerald-400/10" : "border-white/15 bg-white/5"}`}>{icon}{text}</button>;
}
function Delta({ a, b }: { a: number; b: number }) {
  const d = b - a, Icon = d > 0 ? ArrowUp : d < 0 ? ArrowDown : Minus;
  return <span className={`inline-flex items-center gap-1 ${d > 0 ? "text-emerald-300" : d < 0 ? "text-rose-300" : "text-slate-400"}`}><Icon aria-hidden className="h-4 w-4" />{a} → {b}</span>;
}
/** What changed during the day, so the player sees cause and effect instead of numbers silently moving. */
function DayReport({ before, after, level, onClose }: { before: State; after: State; level: Level; onClose: () => void }) {
  const { t } = useTranslation();
  const together = useStore(s => s.settings.together);
  const events = [...new Set(after.chain.slice(before.chain.length).map(c => c.key))];
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="rep-h" className={`${glass} max-h-[90dvh] overscroll-contain w-full max-w-lg overflow-auto bg-slate-900/95 p-5`}>
        <h2 id="rep-h" className="font-head text-2xl font-extrabold">{t("game.report.title", { day: before.day })}</h2>
        <ul className="mt-3 space-y-2">
          {level.res.map(r => (
            <li key={r} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
              <span>{r === "power" ? t("game.battery") : t(`game.${r}`)}</span><Delta a={before.stock[r]} b={after.stock[r]} />
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2"><span>{t("game.report.crew")}</span><Delta a={before.hearts} b={after.hearts} /></li>
        </ul>
        <h3 className="mt-4 font-semibold">{t("game.report.events")}</h3>
        {events.length === 0 ? <p className="text-slate-300">{t("game.report.calm")}</p> : (
          <ul className="mt-1 space-y-2">{events.map(k => <li key={k} className="rounded-xl bg-white/5 p-3"><b>{t(`chain.${k}.title`)}</b><p className="text-slate-200">{t(`chain.${k}.why`)}</p></li>)}</ul>
        )}
        {together && <p className="mt-3 rounded-xl border border-indigo-400/30 bg-indigo-400/10 p-3 text-sm">{t("together.after")}</p>}
        <button autoFocus className={`${btnPrimary} mt-5 w-full`} onClick={onClose}>{t("game.report.next")}<ArrowRight aria-hidden /></button>
      </div>
    </div>
  );
}

function fmt(e: { stock?: Partial<Record<string, number>>; bonus?: number; hearts?: number; science?: number }, side: "gain" | "cost", t: (k: string) => string) {
  const parts: string[] = [], sign = side === "gain" ? 1 : -1;
  for (const [r, v] of Object.entries(e.stock ?? {})) if ((v ?? 0) * sign > 0) parts.push(`${t(`game.${r}`)} ${v! > 0 ? "+" : ""}${v}`);
  if ((e.bonus ?? 0) * sign > 0) parts.push(`${t("game.battery")} ${e.bonus! > 0 ? "+" : ""}${e.bonus}`);
  if ((e.hearts ?? 0) * sign > 0) parts.push(`${t("game.report.crew")} +${e.hearts}`);
  if ((e.science ?? 0) * sign > 0) parts.push(t("game.science"));
  return parts.join(", ");
}
/** Mission Control decision: two options, each shows what you gain and what you pay (the trade-off is the lesson). */
function DecisionModal({ id, onPick }: { id: string; onPick: (p: "a" | "b") => void }) {
  const { t } = useTranslation(), d = DECISIONS.find(x => x.id === id)!;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="dec-h" className={`${glass} max-h-[90dvh] overscroll-contain w-full max-w-lg overflow-auto bg-slate-900/95 p-5`}>
        <h2 id="dec-h" className="font-head text-2xl font-extrabold">{t("decision.title")}</h2>
        <p className="mt-2 text-lg">{t(`decision.${id}.text`)}</p>
        <p className="text-sm text-slate-300">{t("decision.pick")}</p>
        <div className="mt-3 grid gap-3">
          {(["a", "b"] as const).map(k => (
            <button key={k} autoFocus={k === "a"} onClick={() => onPick(k)} className="min-h-14 rounded-2xl border border-white/20 bg-white/5 p-3 text-left hover:bg-white/10">
              <b>{t(`decision.${id}.${k}`)}</b>
              <span className="mt-1 block text-sm text-emerald-300">{t("decision.gain")}: {fmt(d[k], "gain", t)}</span>
              <span className="block text-sm text-rose-300">{t("decision.cost")}: {fmt(d[k], "cost", t)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
/** Bonus science question: right answer = +1 energy block tomorrow, wrong answer = no penalty, always shows the fact. */
function QuizModal({ id, answer, onAnswer, onClose }: { id: string; answer: number; onAnswer: (ok: boolean) => void; onClose: () => void }) {
  const { t } = useTranslation(), [pick, setPick] = useState<number | null>(null);
  const opts = t(`quiz.${id}.o`, { returnObjects: true }) as unknown as string[];
  const choose = (i: number) => { if (pick === null) { setPick(i); onAnswer(i === answer); } };
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="quiz-h" className={`${glass} max-h-[90dvh] overscroll-contain w-full max-w-lg overflow-auto bg-slate-900/95 p-5`}>
        <h2 id="quiz-h" className="font-head text-xl font-extrabold">{t("quiz.title")}</h2>
        <p className="mt-2 text-lg">{t(`quiz.${id}.q`)}</p>
        <div className="mt-3 grid gap-2">
          {opts.map((o, i) => <button key={i} disabled={pick !== null} onClick={() => choose(i)} className={`min-h-12 rounded-xl border px-3 text-left ${pick === null ? "border-white/20 bg-white/5 hover:bg-white/10" : i === answer ? "border-emerald-400 bg-emerald-400/10" : i === pick ? "border-rose-400 bg-rose-400/10" : "border-white/10 opacity-60"}`}>{o}{pick !== null && i === answer ? " ✓" : ""}</button>)}
        </div>
        {pick !== null && <div aria-live="polite" className="mt-3 space-y-2"><p className="font-semibold">{pick === answer ? t("quiz.right") : t("quiz.wrong")}</p><p className="text-slate-200">{t(`quiz.${id}.why`)}</p><button autoFocus className={`${btnPrimary} w-full`} onClick={onClose}>{t("quiz.next")}<ArrowRight aria-hidden /></button></div>}
        {pick === null && <button className={`${btnGhost} mt-3`} onClick={onClose}>{t("common.next")}</button>}
      </div>
    </div>
  );
}
