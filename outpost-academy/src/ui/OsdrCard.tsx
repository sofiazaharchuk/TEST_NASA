import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HeartPulse, ExternalLink } from "lucide-react";
import { loadOsdr, osdrStudyUrl, type OsdrResult } from "../nasa/osdr.ts";
import { SourceChip, glass } from "./bits.tsx";

/** Real NASA OSDR studies about astronaut health (bones). Hidden when NASA has nothing to show. */
export function OsdrCard() {
  const { t } = useTranslation();
  const [r, setR] = useState<OsdrResult | null>(null);
  useEffect(() => { let on = true; loadOsdr({ storage: (() => { try { return localStorage; } catch { return undefined; } })() }).then(x => on && setR(x)); return () => { on = false; }; }, []);
  if (!r?.data) return null;
  const d = r.data;
  return (
    <section className={`${glass} mt-6 p-4`} aria-labelledby="osdr-h">
      <h2 id="osdr-h" className="flex items-center gap-2 font-head text-xl font-extrabold"><HeartPulse aria-hidden className="h-5 w-5 text-rose-300" />{t("osdr.title")}</h2>
      <p className="mt-1 text-slate-100">{t("osdr.count", { n: d.total.toLocaleString() })}</p>
      <p className="mt-1 text-sm text-slate-300">{t("osdr.why")}</p>
      {d.studies.length > 0 && <ul className="mt-2 space-y-1.5">{d.studies.map(s => <li key={s.id}><a className="inline-flex items-start gap-1.5 text-sm text-cyan-300 underline" href={osdrStudyUrl(s.id)} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{s.id}: {s.title}</span></a></li>)}</ul>}
      <p className="mt-2 text-xs text-slate-400">{t(r.source === "live" ? "osdr.live" : "osdr.archive")}</p>
      <div className="mt-2"><SourceChip id="osdr" label={t("common.source")} /></div>
    </section>
  );
}
