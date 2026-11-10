import { Suspense, lazy, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Rocket, Settings as Cog, LayoutGrid, Sun, Moon } from "lucide-react";
import { lazyRetry } from "./lib/resilience.ts";
import { useStore } from "./store.ts";
import { applyLang } from "./i18n/index.ts";
import { AVATARS } from "./ui/avatars.ts";
import Start from "./screens/Start.tsx"; import Levels from "./screens/Levels.tsx";

// Start and Levels load immediately (first paint). The heavier screens are separate chunks, loaded on demand and prefetched when the browser is idle.
const Intro = lazy(lazyRetry(() => import("./screens/Intro.tsx"))), Game = lazy(lazyRetry(() => import("./screens/Game.tsx")));
const Debrief = lazy(lazyRetry(() => import("./screens/Debrief.tsx"))), Settings = lazy(lazyRetry(() => import("./screens/Settings.tsx")));
const SCREENS = { start: Start, levels: Levels, intro: Intro, game: Game, debrief: Debrief, settings: Settings } as const;
const iconBtn = "grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10";

export default function App() {
  const { t } = useTranslation();
  const { screen, settings, profile, go, setSettings } = useStore();
  useEffect(() => {
    const d = document.documentElement;
    d.dataset.theme = settings.theme; d.dataset.big = String(settings.bigText); d.dataset.legible = String(settings.easyFont); d.dataset.reduce = String(settings.reduceMotion);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", settings.theme === "light" ? "#eef2ff" : "#0B1026");
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", settings.theme);
  }, [settings.theme, settings.bigText, settings.easyFont, settings.reduceMotion]);
  useEffect(() => { void applyLang(profile.lang); }, [profile.lang]);
  useEffect(() => {
    const warm = () => { import("./screens/Intro.tsx").catch(() => {}); import("./screens/Game.tsx").catch(() => {}); };
    if ("requestIdleCallback" in window) window.requestIdleCallback(warm); else setTimeout(warm, 1500);
  }, []);
  const Screen = SCREENS[screen], Av = AVATARS[profile.avatar] ?? AVATARS[0];
  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? "always" : "user"}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:text-black">{t("nav.skip")}</a>
      <header className="mx-auto flex max-w-6xl items-center gap-2 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <p className="flex min-w-0 flex-1 items-center gap-2 font-head text-lg font-extrabold text-cyan-300"><Rocket aria-hidden className="anim-float shrink-0" /><span className="truncate">{t("app.name")}</span></p>
        {screen !== "start" && <span className="inline-flex min-w-0 max-w-44 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm"><Av aria-hidden className="h-4 w-4 shrink-0 text-cyan-300" /><span className="truncate max-sm:sr-only">{profile.nickname}</span></span>}
        {screen !== "start" && <button className={iconBtn} aria-label={t("nav.home")} onClick={() => go("levels")}><LayoutGrid aria-hidden /></button>}
        <button className={iconBtn} aria-label={t("nav.theme")} aria-pressed={settings.theme === "light"} title={t("nav.theme")} onClick={() => setSettings({ theme: settings.theme === "light" ? "dark" : "light" })}>{settings.theme === "light" ? <Moon aria-hidden /> : <Sun aria-hidden />}</button>
        <button className={iconBtn} aria-label={t("nav.settings")} onClick={() => go("settings")}><Cog aria-hidden /></button>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div key={screen} initial={{ opacity: 0, y: 16, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}>
            <Suspense fallback={<div role="status" aria-label={t("app.name")} className="grid min-h-[40vh] place-items-center"><Rocket aria-hidden className="anim-float h-10 w-10 text-cyan-300" /></div>}><Screen /></Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
