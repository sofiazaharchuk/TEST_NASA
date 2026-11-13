import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sun, WifiOff, Wifi, Archive } from "lucide-react";
import { loadFlares, strongest, weatherOf, type Result } from "../nasa/donki.ts";
import { LEVELS } from "../data/levels.ts";
import archive from "../data/donkiArchive.json";
import builtin from "../data/donkiBuiltin.json";
import { useStore } from "../store.ts";
import { SourceChip, btnGhost, glass } from "../ui/bits.tsx";
import { Photo } from "../ui/Photo.tsx";

export default function SpaceWeather() {
  const { t } = useTranslation();
  const { openLevel, progress, settings } = useStore();
  const [r, setR] = useState<Result | null>(null);
  useEffect(() => { let on = true; loadFlares({ archive, fallback: builtin, timeoutMs: 12000, key: import.meta.env.VITE_NASA_API_KEY, storage: (() => { try { return localStorage; } catch { return undefined; } })() }).then(x => on && setR(x)); return () => { on = false; }; }, []);
  const known = !!r?.builtin, top = r ? (known ? r.flares[Math.floor(Date.now() / 864e5) % Math.max(1, r.flares.length)] ?? null : strongest(r.flares)) : null, w = weatherOf(top);
  // Storm levels that are open for this player: today's weather decides how strong the storm is.
  const stormLevels = LEVELS.flatMap((l, i) => l.world === "moon" && l.events.some(e => e.type === "storm") && (settings.demo || i <= progress.unlocked) ? [{ l, i }] : []);
  const Badge = r?.source === "live" ? Wifi : r?.source === "archive" ? Archive : WifiOff;
  return (
    <section className={`${glass} mt-6 p-5`} aria-labelledby="sw-h">
      <Photo theme="solar" className="relative -mx-5 -mt-5 mb-3 h-40 rounded-t-2xl sm:h-52" />
      <h2 id="sw-h" className="flex items-center gap-2 font-head text-xl font-extrabold"><Sun aria-hidden className="text-amber-300" />{t("spaceWeather.title")}</h2>
      {!r ? <p className="mt-2 text-slate-300" aria-live="polite">{t("spaceWeather.loading")}</p> : (
        <div className="mt-2 space-y-2" aria-live="polite">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm"><Badge aria-hidden className="h-4 w-4" />{t(`spaceWeather.${r.source}`)}</p>
          {r.source === "none" ? <><p>{t("spaceWeather.noneText")}</p>{import.meta.env.DEV && <p className="text-xs text-amber-300">Why: {r.error ?? "?"}. (HTTP 429 means the shared DEMO_KEY limit is used up.) Get a free key at api.nasa.gov, put VITE_NASA_API_KEY=... in .env, restart, and run node tools/fetch_donki_archive.mjs</p>}</> : <>
            <p>{top && known ? t("spaceWeather.famous", { c: top.classType, d: top.beginTime.slice(0, 10) }) : top ? t("spaceWeather.strongest", { c: top.classType }) : t("spaceWeather.noFlares")}</p>
            <p className="text-slate-200">{t(`spaceWeather.${w}`)}</p>
          </>}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <SourceChip id="donki" label={t("common.source")} />
          </div>
          <div className="pt-2">
            <p className="font-semibold">{t("spaceWeather.play")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {stormLevels.length === 0 && <p className="text-sm text-slate-300">{t("levelsScreen.locked")}</p>}
              {stormLevels.map(({ l, i }) => <button key={l.id} className={btnGhost} onClick={() => openLevel(i, w, r.source === "none" ? null : r.source)}>{t("levelsScreen.level", { n: i + 1 })}: {t(`levels.${l.id}.name`)}</button>)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
