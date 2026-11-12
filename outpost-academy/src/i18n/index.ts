import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGES } from "./languages.ts";
import en from "./en.json"; import uk from "./uk.json";

// English (default + fallback for any missing key) and Ukrainian ship in the main bundle.
// The other languages are separate small chunks, downloaded only when a player picks them.
const LAZY: Record<string, () => Promise<unknown>> = {
  es: () => import("./es.json"), fr: () => import("./fr.json"), de: () => import("./de.json"), pl: () => import("./pl.json"),
  pt: () => import("./pt.json"), tr: () => import("./tr.json"), ar: () => import("./ar.json"), hi: () => import("./hi.json"),
};
i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, uk: { translation: uk } },
  lng: "en", fallbackLng: "en", interpolation: { escapeValue: false },
});
export async function applyLang(code: string) {
  if (!i18n.hasResourceBundle(code, "translation") && LAZY[code]) {
    try { i18n.addResourceBundle(code, "translation", ((await LAZY[code]()) as { default: object }).default); } catch { code = "en"; } // offline: stay in English
  }
  await i18n.changeLanguage(code);
  document.documentElement.lang = code;
  document.documentElement.dir = LANGUAGES.find(l => l.code === code)?.dir ?? "ltr";
}
export default i18n;
