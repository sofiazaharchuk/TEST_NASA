import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, Zap } from "lucide-react";
import { MARS_SKIES } from "../ui/MarsWeatherPicker.tsx";
import { LEVELS } from "../data/levels.ts";
import { LEVEL_THEME } from "../data/themes.ts";
import builtin from "../data/donkiBuiltin.json";
import { useStore } from "../store.ts";
import { badgesOf } from "../game/logic.ts";
import { weatherOf } from "../nasa/donki.ts";
import { Stars, btnGhost, glass } from "../ui/bits.tsx";
import { Photo } from "../ui/Photo.tsx";
import SpaceWeather from "./SpaceWeather.tsx";
import { OsdrCard } from "../ui/OsdrCard.tsx";
import { PhotoOfDay } from "../ui/PhotoOfDay.tsx";

const EMOJI: Record<string, string> = { first_flight: "🚀", night_owl: "🌙", storm_survivor: "⚡", gardener: "🌱", water_keeper: "💧", zero_waste: "♻️", scientist: "🔬", commander: "👨‍🚀", mars_pioneer: "🔴" };

export default function Levels() {
  const { t } = useTranslation();
  const { progress, settings, profile, openLevel } = useStore();
  const total = LEVELS.length, done = LEVELS.filter(l => progress.won?.[l.id]).length, nextIdx = LEVELS.findIndex(l => !progress.won?.[l.id]);
  return (
    <div>
      <p className="text-cyan-300">{t("levelsScreen.hello", { name: profile.nickname })}</p>
      <h1 className="text-gradient font-head text-3xl font-extrabold sm:text-4xl">{t("levelsScreen.title")}</h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t("levelsScreen.progress", { done, total })}>
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all duration-700" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <span className="text-sm text-slate-300">{t("levelsScreen.progress", { done, total })}</span>
      </div>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {LEVELS.map((l, i) => {
          const open = settings.demo || i <= progress.unlocked, st = progress.stars[l.id], done = !!progress.won?.[l.id];
          return (
            <motion.li key={l.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
              <button disabled={!open} onClick={() => openLevel(i)} aria-label={`${t("levelsScreen.level", { n: i + 1 })}: ${t(`levels.${l.id}.name`)}`}
                className={`on-photo group relative isolate flex min-h-44 w-full overflow-hidden rounded-3xl border text-left transition-all duration-300 sm:min-h-52 ${open ? "border-white/15 hover:-translate-y-1 hover:border-cyan-300/60 hover:shadow-[0_0_30px_rgba(34,211,238,.25)]" : "border-white/5 grayscale"} ${open && i === nextIdx ? "ring-2 ring-cyan-300/70" : ""}`}>
                <Photo theme={LEVEL_THEME[l.id]} className="absolute inset-0 -z-10 transition-transform duration-700 group-hover:scale-105" overlay credit={false} />
                <span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 backdrop-blur">{t("levelsScreen.level", { n: i + 1 })} · {t(`levelsScreen.world.${l.world}`)}</span>
                <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-slate-950/70 backdrop-blur">{open ? (done ? <CheckCircle2 aria-hidden className="text-emerald-300" /> : <Play aria-hidden />) : <Lock aria-hidden />}</span>
                <span className="mt-auto flex w-full items-end justify-between gap-3 p-4">
                  <span className="min-w-0"><span className="block font-head text-2xl font-extrabold leading-tight">{t(`levels.${l.id}.name`)}</span>{!open && <span className="text-sm text-slate-300">{t("levelsScreen.locked")}</span>}{open && i === nextIdx && <span className="mt-1 inline-block rounded-full bg-cyan-400/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-cyan-200">{t("levelsScreen.next")}</span>}</span>
                  {st && <span className="shrink-0"><Stars n={Math.round((st.safe + st.smart + st.curious) / 3)} label={t(`levels.${l.id}.name`)} /></span>}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
      <SpaceWeather />
      <PhotoOfDay />
      <OsdrCard />
      <Badges />
      {(settings.demo || progress.unlocked >= 2) && <><ReplayStorms /><MarsWeather /></>}
    </div>
  );
}
function Badges() {
  const { t } = useTranslation();
  const progress = useStore(s => s.progress);
  return (
    <section className={`${glass} mt-6 p-4`} aria-labelledby="badges-h">
      <h2 id="badges-h" className="font-head text-xl font-extrabold">{t("badges.title")}</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {badgesOf(progress).map(b => (
          <li key={b.id} className={`flex items-center gap-3 rounded-2xl p-3 ${b.earned ? "bg-amber-400/10 ring-1 ring-amber-300/40" : "bg-white/5 opacity-60"}`}>
            <span aria-hidden className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-2xl ${b.earned ? "anim-pop" : ""}`}>{b.earned ? EMOJI[b.id] : "🔒"}</span>
            <span className="min-w-0"><b className="block text-sm leading-tight">{t(`badges.${b.id}.name`)}</b><span className="text-xs text-slate-300">{t(`badges.${b.id}.desc`)}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
/** Play the storm level with the strength of a real, famous flare. */
function ReplayStorms() {
  const { t } = useTranslation();
  const { openLevel } = useStore();
  const stormIdx = LEVELS.findIndex(l => l.id === "storm_watch");
  const picks = (builtin.events as { classType: string; beginTime: string }[]).filter(e => ["2003-11-04", "2017-09-06", "2024-10-03"].includes(e.beginTime));
  return (
    <section className={`${glass} mt-6 border-violet-400/30 p-4`} aria-labelledby="replay-h">
      <h2 id="replay-h" className="flex items-center gap-2 font-head text-xl font-extrabold"><Zap aria-hidden className="h-5 w-5 text-violet-300" />{t("replay.title")}</h2>
      <p className="mt-1 text-slate-200">{t("replay.text")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {picks.map(f => <button key={f.beginTime} className={btnGhost} onClick={() => openLevel(stormIdx, weatherOf({ id: f.beginTime, classType: f.classType, beginTime: f.beginTime }), "archive", `${f.classType} · ${f.beginTime}`)}>{t("replay.btn", { c: f.classType, d: f.beginTime })}</button>)}
      </div>
    </section>
  );
}

/** Pick the sky for a Mars mission and play it. Scenarios built from real Martian weather (dust), not a live feed. */
function MarsWeather() {
  const { t } = useTranslation();
  const { openLevel } = useStore();
  const idx = LEVELS.findIndex(l => l.id === "mars_arrival");
  return (
    <section className={`${glass} mt-6 border-orange-400/30 p-4`} aria-labelledby="mars-h">
      <h2 id="mars-h" className="font-head text-xl font-extrabold">{t("marsWeather.title")}</h2>
      <p className="mt-1 text-slate-200">{t("marsWeather.text")}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {MARS_SKIES.map(({ w, Icon }) => (
          <li key={w}>
            <button className="h-full min-h-20 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-left transition-all hover:-translate-y-0.5 hover:bg-white/10" onClick={() => openLevel(idx, w)}>
              <span className="flex items-center gap-2 font-semibold"><Icon aria-hidden className="h-5 w-5 shrink-0 text-orange-300" />{t(`marsWeather.${w}.name`)}</span>
              <span className="mt-1 block text-sm text-slate-300">{t(`marsWeather.${w}.desc`)}</span>
              <span className="mt-2 block text-sm font-semibold text-cyan-300">{t("marsWeather.play")}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-400">{t("marsWeather.note")}</p>
    </section>
  );
}
