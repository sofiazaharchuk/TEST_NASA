import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sun, WifiOff, Wifi, Archive } from "lucide-react";
import { loadFlares, strongest, weatherOf, type Result } from "../nasa/donki.ts";
import archive from "../data/donkiArchive.json";
import builtin from "../data/donkiBuiltin.json";
import { useStore } from "../store.ts";
import { SourceChip, btnPrimary, glass } from "../ui/bits.tsx";
import { Photo } from "../ui/Photo.tsx";

export default function SpaceWeather() {
  const { t } = useTranslation();
  const openLevel = useStore(s => s.openLevel);
  const [r, setR] = useState<Result | null>(null);
  const usingBuiltin = (archive.events as unknown[]).length === 0; // no downloaded archive yet: show a famous real flare instead of nothing
  useEffect(() => { let on = true; loadFlares({ archive: usingBuiltin ? builtin : archive, timeoutMs: 8000, key: import.meta.env.VITE_NASA_API_KEY, storage: (() => { try { return localStorage; } catch { return undefined; } })() }).then(x => on && setR(x)); return () => { on = false; }; }, []);
  const known = r?.source === "archive" && usingBuiltin, top = r ? (known ? r.flares[Math.floor(Date.now() / 864e5) % Math.max(1, r.flares.length)] ?? null : strongest(r.flares)) : null, w = weatherOf(top);
  const Badge = r?.source === "live" ? Wifi : r?.source === "archive" ? Archive : WifiOff;
  return (
    <section className={`${glass} mt-6 p-5`} aria-labelledby="sw-h">
      <Photo theme="solar" className="relative -mx-5 -mt-5 mb-3 h-52 rounded-t-2xl sm:h-72" />
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
            {r.source !== "none" && <button className={btnPrimary} onClick={() => openLevel(2, w, r.source)}>{t("spaceWeather.play")}</button>}
          </div>
        </div>
      )}
    </section>
  );
}
