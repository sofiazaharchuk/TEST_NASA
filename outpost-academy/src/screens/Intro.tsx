import { useTranslation } from "react-i18next";
import { Sparkles, Users, MessageCircleQuestion, FlaskConical, Lightbulb } from "lucide-react";
import { LEVELS } from "../data/levels.ts";
import { useStore } from "../store.ts";
import { newResource } from "../game/logic.ts";
import { Photo } from "../ui/Photo.tsx";
import { FactCard } from "../ui/FactCard.tsx";
import { MarsWeatherPicker } from "../ui/MarsWeatherPicker.tsx";
import { LEVEL_THEME } from "../data/themes.ts";
import { SourceChip, btnPrimary, btnGhost, glass } from "../ui/bits.tsx";
import { LEVEL_SOURCE } from "../data/levelSources.ts";

export default function Intro() {
  const { t } = useTranslation();
  const { levelIdx, settings, setSettings, startLevel } = useStore();
  const l = LEVELS[levelIdx], k = `levels.${l.id}`, fresh = newResource(l, LEVELS[levelIdx - 1]);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className={`${glass} p-6`}>
        <Photo theme={LEVEL_THEME[l.id]} className="relative -mx-6 -mt-6 mb-4 h-52 rounded-t-2xl sm:h-72" kenburns />
        <p className="text-sm text-cyan-300">{t("levelsScreen.level", { n: levelIdx + 1 })}</p>
        <h1 className="font-head text-4xl font-extrabold">{t(`${k}.name`)}</h1>
        {fresh && <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300"><Sparkles aria-hidden className="h-4 w-4" />{t("intro.newSystem")}: {t(`resources.${fresh}`)}</p>}
        <p className="mt-4 text-lg">{t(`${k}.intro`)}</p>
        <p className="mt-3"><b>{t("intro.goal")}:</b> {t(`${k}.goal`)}</p>
        <p className="mt-2 text-slate-300"><b>{t("intro.tip")}:</b> {t(`${k}.tip`)}</p>
        {l.world === "mars" && <MarsWeatherPicker />}
        <ol className="mt-5 grid gap-2 sm:grid-cols-3" aria-label={t("intro.howTitle")}>
          {[["⚡", "intro.how1"], ["➕", "intro.how2"], ["▶️", "intro.how3"]].map(([e, k], i) => (
            <li key={k} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3"><span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-2xl">{e}</span><span><b className="text-cyan-300">{i + 1}.</b> {t(k)}</span></li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className={btnPrimary} onClick={startLevel}>{t("intro.start")}</button>
          <button className={btnGhost} aria-pressed={settings.together} onClick={() => setSettings({ together: !settings.together })}><Users aria-hidden />{t("common.together")}</button>
        </div>
        <p className="mt-3 text-sm text-slate-300">{t("together.what")}</p>
      </div>
      <div className="space-y-4">
        <FactCard index={levelIdx} />
      {settings.together && (
        <aside className={`${glass} space-y-3 p-4`} aria-label={t("common.forGrownUps")}>
          <p className="text-xs tracking-wider text-slate-400">{t("common.forGrownUps").toUpperCase()}</p>
          <section><h2 className="flex items-center gap-2 font-semibold"><MessageCircleQuestion aria-hidden className="h-5 w-5 text-cyan-300" />{t("common.askTogether")}</h2><p className="mt-1 text-slate-200">{t(`${k}.askKid`)}</p></section>
          <section><h2 className="flex items-center gap-2 font-semibold"><FlaskConical aria-hidden className="h-5 w-5 text-emerald-300" />{t("common.realScience")}</h2><p className="mt-1 mb-2 text-slate-200">{t(`${k}.fact`)}</p><SourceChip id={LEVEL_SOURCE[l.id]} label={t("common.source")} /></section>
          <section><h2 className="flex items-center gap-2 font-semibold"><Lightbulb aria-hidden className="h-5 w-5 text-amber-300" />{t("common.whyMatters")}</h2><p className="mt-1 text-slate-200">{t(`${k}.learn`)}</p></section>
        </aside>
      )}
      </div>
    </div>
  );
}
