import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Circle, X } from "lucide-react";
import { LANGUAGES } from "../i18n/languages.ts";
import { applyLang } from "../i18n/index.ts";
import { useStore, type Settings as S } from "../store.ts";
import { NameField } from "../ui/NameField.tsx";
import { btnGhost, glass } from "../ui/bits.tsx";

const TOGGLES: [keyof S, string][] = [["sound", "settings.sound"], ["reduceMotion", "settings.reduceMotion"], ["bigText", "settings.bigText"], ["easyFont", "settings.easyFont"], ["demo", "settingsExtra.demo"]];
export default function Settings() {
  const { t } = useTranslation();
  const { profile, setProfile, settings, setSettings, go, back } = useStore();
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && go(back); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [go, back]);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 font-head text-3xl font-extrabold">{t("settings.title")}</h1>
        <button className="grid h-12 w-12 place-items-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10" aria-label={t("nav.close")} onClick={() => go(back)}><X aria-hidden /></button>
      </div>
      <section className={`${glass} p-4`}><NameField id="name-settings" /></section>
      <section className={`${glass} p-3`} aria-labelledby="lang-h">
        <h2 id="lang-h" className="px-2 pt-1 text-sm tracking-wider text-slate-400">{t("settings.language").toUpperCase()}</h2>
        <div role="radiogroup" aria-labelledby="lang-h">
          {LANGUAGES.map(l => (
            <button key={l.code} role="radio" aria-checked={profile.lang === l.code} onClick={() => { setProfile({ lang: l.code }); applyLang(l.code); }}
              className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left transition-all hover:bg-white/10 ${profile.lang === l.code ? "border-cyan-400/60 bg-cyan-400/10" : "border-transparent"}`}>
              {profile.lang === l.code ? <CheckCircle2 aria-hidden className="text-cyan-300" /> : <Circle aria-hidden className="text-slate-500" />}
              <span className="flex-1">{l.name}</span>
              {l.status === "beta" && <span title={t("settingsExtra.betaHint")} className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">{t("settingsExtra.beta")}</span>}
            </button>
          ))}
        </div>
      </section>
      <section className={`${glass} p-2`}>
        {TOGGLES.map(([k, key]) => (
          <button key={k} role="switch" aria-checked={settings[k]} onClick={() => setSettings({ [k]: !settings[k] } as Partial<S>)} className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-white/5">
            <span className="flex-1">{t(key)}</span>
            <span className={`relative h-7 w-12 rounded-full transition-all ${settings[k] ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "bg-white/20"}`}><i className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${settings[k] ? "left-[22px]" : "left-0.5"}`} /></span>
          </button>
        ))}
      </section>
      <p className="text-sm text-slate-400">{t("settings.saved")}</p>
      <button className={btnGhost} onClick={() => go(back)}>{t("nav.back")}</button>
    </div>
  );
}
