import { useTranslation } from "react-i18next";
import { Printer } from "lucide-react";
import { btnGhost, btnPrimary } from "./bits.tsx";
/** Printable "Junior Astronaut" certificate. "Print" also offers "Save as PDF". Print CSS (index.css) shows only #certificate. */
export function Certificate({ name, level, stars, onClose }: { name: string; level: string; stars: number; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-auto bg-slate-950/80 p-4">
      <div className="w-full max-w-2xl">
        <div id="certificate" role="dialog" aria-modal="true" aria-label={t("cert.title")} className="rounded-3xl border-[10px] border-double border-amber-500 bg-gradient-to-br from-amber-50 to-white p-6 text-center text-slate-900 shadow-2xl sm:p-10">
          <p className="text-5xl" aria-hidden>🚀</p>
          <p className="mt-2 font-head text-sm font-bold uppercase tracking-[.3em] text-amber-700">Outpost Academy</p>
          <h2 className="mt-3 font-head text-3xl font-extrabold sm:text-4xl">{t("cert.title")}</h2>
          <p className="mt-4 text-slate-600">{t("cert.awarded")}</p>
          <p className="my-2 break-words font-head text-3xl font-extrabold text-indigo-700 sm:text-4xl">{name}</p>
          <p className="text-lg">{t("cert.text", { level })}</p>
          <p className="mt-3 text-2xl" role="img" aria-label={`${stars}/3`}>{"⭐".repeat(Math.max(1, stars))}</p>
          <p className="mt-4 text-sm text-slate-600">{new Date().toLocaleDateString(i18n.language)}</p>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3 print:hidden">
          <button autoFocus className={btnPrimary} onClick={() => window.print()}><Printer aria-hidden />{t("cert.print")}</button>
          <button className={btnGhost} onClick={onClose}>{t("cert.close")}</button>
        </div>
      </div>
    </div>
  );
}
