import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Play, Zap } from "lucide-react";
import { LEVELS } from "../data/levels.ts";
import { LEVEL_THEME } from "../data/themes.ts";
import builtin from "../data/donkiBuiltin.json";
import { useStore } from "../store.ts";
import { badgesOf } from "../game/logic.ts";
import { weatherOf } from "../nasa/donki.ts";
import { Stars, btnGhost, glass } from "../ui/bits.tsx";
import { Photo } from "../ui/Photo.tsx";
import SpaceWeather from "./SpaceWeather.tsx";

const EMOJI: Record<string, string> = { first_flight: "🚀", night_owl: "🌙", mars_pioneer: "🔴", dust_rider: "🌪️", storm_survivor: "⚡", gardener: "🌱", water_keeper: "💧", zero_waste: "♻️", scientist: "🔬", commander: "👨‍🚀" };

export default function Levels() {
  const { t } = useTranslation();
  const { progress, settings, profile, openLevel } = useStore();
  return (
    <div>
      <p className="text-cyan-300">{t("levelsScreen.hello", { name: profile.nickname })}</p>
      <h1 className="font-head text-3xl font-extrabold sm:text-4xl">{t("levelsScreen.title")}</h1>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {LEVELS.map((l, i) => {
          const open = settings.demo || i <= progress.unlocked, st = progress.stars[l.id], done = !!progress.won?.[l.id];
          const firstOfWorld = i === 0 || LEVELS[i - 1].world !== l.world;
          return (
            <Fragment key={l.id}>
            {firstOfWorld && <li className="col-span-full pt-2 first:pt-0"><h2 className="font-head text-xl font-extrabold">{t(`levelsScreen.${l.world}Missions`)}</h2>{l.world === "mars" && !open && <p className="text-sm text-slate-300">{t("levelsScreen.marsUnlock")}</p>}</li>}
            <motion.li initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
              <button disabled={!open} onClick={() => openLevel(i)} aria-label={`${t("levelsScreen.level", { n: i + 1 })}: ${t(`levels.${l.id}.name`)}`}
                className={`on-photo group relative isolate flex min-h-44 w-full overflow-hidden rounded-3xl border text-left transition-all duration-300 sm:min-h-52 ${open ? "border-white/15 hover:border-cyan-300/60 hover:shadow-[0_0_30px_rgba(34,211,238,.25)]" : "border-white/5 grayscale"}`}>
                <Photo theme={LEVEL_THEME[l.id]} className="absolute inset-0 -z-10 transition-transform duration-700 group-hover:scale-105" overlay credit={false} />
                <span className="absolute left-3 top-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 backdrop-blur">{t("levelsScreen.level", { n: i + 1 })}</span>
                <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-slate-950/70 backdrop-blur">{open ? (done ? <CheckCircle2 aria-hidden className="text-emerald-300" /> : <Play aria-hidden />) : <Lock aria-hidden />}</span>
                <span className="mt-auto flex w-full items-end justify-between gap-3 p-4">
                  <span className="min-w-0"><span className="block font-head text-2xl font-extrabold leading-tight">{t(`levels.${l.id}.name`)}</span>{!open && <span className="text-sm text-slate-300">{t("levelsScreen.locked")}</span>}</span>
                  {st && <span className="shrink-0"><Stars n={Math.round((st.safe + st.smart + st.curious) / 3)} label={t(`levels.${l.id}.name`)} /></span>}
                </span>
              </button>
            </motion.li>
            </Fragment>
          );
        })}
      </ul>
      <Badges />
      {(settings.demo || progress.unlocked >= 2) && <><SpaceWeather /><ReplayStorms /></>}
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
