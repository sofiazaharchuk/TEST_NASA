import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Camera, ExternalLink } from "lucide-react";
import { loadApod, type ApodResult } from "../nasa/apod.ts";
import { SourceChip, glass } from "./bits.tsx";

/** NASA picture of the day (APOD). Hidden when NASA has nothing to show, so the Levels screen never gets an empty card. */
export function PhotoOfDay() {
  const { t } = useTranslation();
  const [r, setR] = useState<ApodResult | null>(null);
  useEffect(() => { let on = true; loadApod({ key: import.meta.env.VITE_NASA_API_KEY, storage: (() => { try { return localStorage; } catch { return undefined; } })() }).then(x => on && setR(x)); return () => { on = false; }; }, []);
  if (!r?.apod) return null;
  const a = r.apod;
  return (
    <section className={`${glass} mt-6 overflow-hidden`} aria-labelledby="apod-h">
      <div className="relative h-44 sm:h-60">
        <img src={a.url} alt={a.title} loading="lazy" decoding="async" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
      </div>
      <div className="p-4">
        <h2 id="apod-h" className="flex items-center gap-2 font-head text-xl font-extrabold"><Camera aria-hidden className="h-5 w-5 text-cyan-300" />{t("apod.title")}</h2>
        <p className="mt-1 text-slate-100">{a.title} <span className="text-sm text-slate-400">({a.date})</span></p>
        <p className="mt-1 text-xs text-slate-400">{a.copyright ? t("apod.credit", { c: a.copyright }) : t("apod.creditNasa")} · {t(r.source === "live" ? "apod.live" : "apod.archive")}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <SourceChip id="apod" label={t("common.source")} />
          <a className="inline-flex items-center gap-1.5 text-xs text-cyan-300 underline" href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden className="h-3.5 w-3.5" />{t("apod.open")}</a>
        </div>
      </div>
    </section>
  );
}
