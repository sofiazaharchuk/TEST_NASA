import { useTranslation } from "react-i18next";
import { Users, MessageCircleQuestion, FlaskConical } from "lucide-react";
import { glass, SourceChip } from "./bits.tsx";
import { LEVEL_SOURCE } from "../data/levelSources.ts";

export type Q = "air" | "waste" | "storm" | "micro" | "ok";
/** Grown-up helper: a question that fits what is happening on screen right now, plus the real science behind the level. */
export function CoPilot({ levelId, q }: { levelId: string; q: Q }) {
  const { t } = useTranslation();
  return (
    <aside className={`${glass} space-y-3 border-indigo-400/30 p-4`} aria-label={t("together.title")}>
      <h2 className="flex items-center gap-2 font-head text-lg font-extrabold"><Users aria-hidden className="h-5 w-5 text-indigo-300" />{t("together.title")}</h2>
      <p className="text-sm text-slate-300">{t("together.roles")}</p>
      <p className="flex gap-2"><MessageCircleQuestion aria-hidden className="mt-1 h-5 w-5 shrink-0 text-cyan-300" /><span aria-live="polite">{t(`together.q.${q}`)}</span></p>
      <details className="rounded-xl bg-white/5 p-3">
        <summary className="cursor-pointer font-medium"><FlaskConical aria-hidden className="mr-2 inline h-4 w-4 text-emerald-300" />{t("common.realScience")}</summary>
        <p className="mt-2">{t(`levels.${levelId}.fact`)}</p>
        <div className="mt-2"><SourceChip id={LEVEL_SOURCE[levelId]} label={t("common.source")} /></div>
      </details>
    </aside>
  );
}
