import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Award } from "lucide-react";
import { FactCard } from "../ui/FactCard.tsx";
import { Certificate } from "../ui/Certificate.tsx";
import { motion } from "framer-motion";
import { ArrowDown, CheckCircle2, Circle, Users, FlaskConical, Heart, ShieldAlert, ShieldCheck, Wind, BatteryFull, SunDim, Droplets, Sprout, Orbit, RefreshCw, Target, Bot, Radio, Copy, ClipboardCheck, Snowflake, CloudFog, Tornado, type LucideIcon } from "lucide-react";
import { LEVELS } from "../data/levels.ts";
import { LEVEL_THEME } from "../data/themes.ts";
import { Photo } from "../ui/Photo.tsx";
import { useStore } from "../store.ts";
import { chainSteps, taskDone } from "../game/logic.ts";
import { stars } from "../sim/engine.ts";
import { LEVEL_SOURCE } from "../data/levelSources.ts";
import { SourceChip, Stars, btnGhost, btnPrimary, glass } from "../ui/bits.tsx";

const ICON: Record<string, [LucideIcon, string]> = {
  storm_weak_shield: [ShieldAlert, "shield"], storm_ok: [ShieldCheck, "shield"], air_short: [Wind, "air"], air_empty: [Wind, "air"],
  battery_full_wasted: [BatteryFull, "power"], dust_cut_power: [SunDim, "power"], water_short: [Droplets, "water"],
  science_air_cost: [FlaskConical, "air"], drone_used: [Bot, "power"], radio_used: [Radio, "power"], clean_air_cost: [Wind, "air"], mars_cold: [Snowflake, "power"], mars_dusty: [CloudFog, "power"], mars_global: [Wind, "power"], mars_devil: [Tornado, "power"], food_short: [Sprout, "food"], micro_hit: [Orbit, "shield"],
};
export default function Debrief() {
  const { t } = useTranslation();
  const { game: g, levelIdx, startLevel, openLevel, go, settings } = useStore();
  const [copied, setCopied] = useState(false), [showCert, setShowCert] = useState(false);
  const nick = useStore(x => x.profile.nickname);
  if (!g) return null;
  const l = LEVELS[levelIdx], s = stars(g), steps = chainSteps(g), win = g.over === "success";
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {win && !settings.reduceMotion && <Confetti />}
      <div className="on-photo relative h-48 overflow-hidden rounded-3xl border border-white/10 sm:h-60">
        <Photo theme={LEVEL_THEME[l.id]} className="absolute inset-0" kenburns />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4">
          <Heart aria-hidden className={`h-10 w-10 shrink-0 ${win ? "anim-beat fill-rose-400 text-rose-400" : "text-slate-300"}`} />
          <div><h1 className="font-head text-3xl font-extrabold">{t(win ? "debrief.success" : "debrief.early")}</h1>{!win && <p className="text-slate-200">{t("debrief.lets")}</p>}</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["safe", "smart", "curious"] as const).map(k => <div key={k} className={`${glass} p-3`}><p className="text-sm text-slate-300">{t(`debrief.${k}`)}</p><Stars n={s[k]} label={t(`debrief.${k}`)} /></div>)}
      </div>
      <h2 className="pt-2 font-head text-xl font-extrabold">{t("common.whyChain")}</h2>
      {steps.length === 0 && <p className={`${glass} p-4`}>{t("debrief.noIssues")}</p>}
      <ol className="space-y-1">
        {steps.map((k, i) => {
          const [Icon, res] = ICON[k] ?? [Orbit, "shield"];
          return (
            <li key={k}>
              {i > 0 && <p className="flex items-center justify-center gap-1 py-1 text-sm text-cyan-300"><ArrowDown aria-hidden className="h-4 w-4" />{t("common.because")}</p>}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className={`${glass} flex items-center gap-4 p-3`}>
                <div className="w-16 shrink-0 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/40"><Icon aria-hidden className="h-7 w-7 text-cyan-300" /></div><p className="mt-1 text-xs text-slate-300">{t(`resources.${res}`)}</p></div>
                <div><h3 className="font-head text-lg font-extrabold">{t(`chain.${k}.title`)}</h3><p className="text-slate-200">{t(`chain.${k}.why`)}</p></div>
              </motion.div>
            </li>
          );
        })}
      </ol>
      <div className={`${glass} p-4`}>
        <h2 className="font-semibold">{t("tasks.title")}: {t("tasks.result", { done: l.tasks.filter(k => taskDone(k, g)).length, total: l.tasks.length })}</h2>
        <ul className="mt-2 space-y-1">{l.tasks.map(k => <li key={k.id} className="flex items-center gap-2">{taskDone(k, g) ? <CheckCircle2 aria-hidden className="h-5 w-5 text-emerald-300" /> : <Circle aria-hidden className="h-5 w-5 text-slate-500" />}{t(`tasks.${k.kind}`, { n: k.n })}</li>)}</ul>
      </div>
      {settings.together && <div className={`${glass} border-indigo-400/30 p-4`}><h2 className="flex items-center gap-2 font-semibold"><Users aria-hidden className="h-5 w-5 text-indigo-300" />{t("together.title")}</h2><p className="mt-1">{t("together.debrief")}</p><p className="mt-1 text-slate-200">{t(`levels.${l.id}.askKid`)}</p></div>}
      {settings.together && (() => {
        const text = t("grownup.text", { level: t(`levels.${l.id}.name`), result: t(win ? "grownup.win" : "grownup.fail"), h: g.hearts, sc: g.science, w: g.wasted, q: t(`levels.${l.id}.askKid`), learn: t(`levels.${l.id}.learn`) });
        return (
          <div className={`${glass} border-indigo-400/30 p-4`}>
            <h2 className="flex items-center gap-2 font-semibold"><ClipboardCheck aria-hidden className="h-5 w-5 text-indigo-300" />{t("grownup.title")}</h2>
            <p className="mt-1 whitespace-pre-line text-slate-200">{text}</p>
            <button className={`${btnGhost} mt-3`} onClick={() => { navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => setCopied(false)); }}><Copy aria-hidden />{t(copied ? "grownup.copied" : "grownup.copy")}</button>
          </div>
        );
      })()}
      <div className={`${glass} p-4`}><h2 className="flex items-center gap-2 font-semibold"><Target aria-hidden className="h-5 w-5 text-cyan-300" />{t("common.tryNext")}</h2><p className="mt-1">{t("debrief.try")}</p></div>
      <div className={`${glass} p-4`}><h2 className="flex items-center gap-2 font-semibold"><FlaskConical aria-hidden className="h-5 w-5 text-emerald-300" />{t("common.realScience")}</h2><p className="mt-1 mb-2">{t(`levels.${l.id}.fact`)}</p><SourceChip id={LEVEL_SOURCE[l.id]} label={t("common.source")} /></div>
      <FactCard index={levelIdx + 1} />
      {showCert && <Certificate name={nick} level={t(`levels.${l.id}.name`)} stars={Math.round((s.safe + s.smart + s.curious) / 3)} onClose={() => setShowCert(false)} />}
      <div className="flex flex-wrap gap-3 pt-2">
        {win && <button className={btnPrimary} onClick={() => setShowCert(true)}><Award aria-hidden />{t("cert.btn")}</button>}
        <button className={win ? btnGhost : btnPrimary} onClick={startLevel}><RefreshCw aria-hidden />{t("common.tryAgain")}</button>
        {win && levelIdx < LEVELS.length - 1 && <button className={btnGhost} onClick={() => openLevel(levelIdx + 1)}>{t("common.nextLevel")}</button>}
        <button className={btnGhost} onClick={() => go("levels")}>{t("nav.home")}</button>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {Array.from({ length: 28 }, (_, i) => <span key={i} className="absolute top-0 block h-3 w-2 rounded-sm" style={{ left: `${(i * 37) % 100}%`, background: ["#fbbf24", "#22d3ee", "#fb7185", "#a78bfa", "#34d399"][i % 5], animation: `fx-confetti ${2.5 + (i % 5) * 0.4}s ease-in ${(i % 7) * 0.15}s 1 forwards` }} />)}
    </div>
  );
}
