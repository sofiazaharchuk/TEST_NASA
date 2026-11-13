import { useTranslation } from "react-i18next";
import { Lightbulb } from "lucide-react";
import { FACTS } from "../data/facts.ts";
import { Photo } from "./Photo.tsx";
import { SourceChip, glass } from "./bits.tsx";
/** A real NASA photo + one short fact with its source. */
export function FactCard({ index }: { index: number }) {
  const { t } = useTranslation(), f = FACTS[index % FACTS.length];
  return (
    <section className={`${glass} overflow-hidden`}>
      <div className="relative h-40 sm:h-48"><Photo theme={f.theme} className="absolute inset-0" kenburns /></div>
      <div className="p-4">
        <h2 className="flex items-center gap-2 font-head text-lg font-extrabold"><Lightbulb aria-hidden className="h-5 w-5 text-amber-300" />{t("facts.title")}</h2>
        <p className="mt-1 text-slate-100">{t(`facts.${f.id}`)}</p>
        <div className="mt-2"><SourceChip id={f.source} label={t("common.source")} /></div>
      </div>
    </section>
  );
}
