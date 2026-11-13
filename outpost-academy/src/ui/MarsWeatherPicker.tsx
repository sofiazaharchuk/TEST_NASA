import { useTranslation } from "react-i18next";
import { Sun, CloudFog, Wind } from "lucide-react";
import type { Weather } from "../sim/engine.ts";
import { useStore } from "../store.ts";

export const MARS_SKIES: { w: Weather; Icon: typeof Sun }[] = [{ w: "calm", Icon: Sun }, { w: "minor", Icon: CloudFog }, { w: "strong", Icon: Wind }];

/** Choose the sky for a Mars mission. Dust takes energy away: clear 0, haze -1, global dust storm -2 energy blocks every sol. */
export function MarsWeatherPicker() {
  const { t } = useTranslation();
  const { weather, setWeather } = useStore();
  return (
    <section className="mt-5 rounded-2xl border border-orange-400/40 bg-orange-400/10 p-4" aria-labelledby="mars-sky-h">
      <h2 id="mars-sky-h" className="font-head text-lg font-extrabold">{t("marsWeather.title")}</h2>
      <p className="mt-1 text-sm text-slate-200">{t("marsWeather.text")}</p>
      <div role="radiogroup" aria-labelledby="mars-sky-h" className="mt-3 grid gap-2 sm:grid-cols-3">
        {MARS_SKIES.map(({ w, Icon }) => (
          <button key={w} role="radio" aria-checked={weather === w} onClick={() => setWeather(w)}
            className={`min-h-16 rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${weather === w ? "border-orange-300 bg-orange-400/20" : "border-white/15 bg-white/5"}`}>
            <span className="flex items-center gap-2 font-semibold"><Icon aria-hidden className="h-5 w-5 shrink-0 text-orange-300" />{t(`marsWeather.${w}.name`)}</span>
            <span className="mt-1 block text-sm text-slate-300">{t(`marsWeather.${w}.desc`)}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-400">{t("marsWeather.note")}</p>
    </section>
  );
}
