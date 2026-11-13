import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AVATARS } from "../ui/avatars.ts";
import { useStore } from "../store.ts";
import { randomNick } from "../game/logic.ts";
import { btnPrimary, glass } from "../ui/bits.tsx";
import { NameField } from "../ui/NameField.tsx";
import { Photo } from "../ui/Photo.tsx";

export default function Start() {
  const { t } = useTranslation();
  const { profile, setProfile, go } = useStore();
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="on-photo relative min-h-72 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,.5),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(6,182,212,.35),transparent_50%)]">
        <Slideshow />
        <div className="relative p-6">
          <p className="text-cyan-300">{t("app.name")}</p>
          <h1 className="mt-3 font-head text-3xl font-extrabold leading-tight sm:text-4xl">{t("app.tagline")}</h1>
        </div>
      </div>
      <div className={`${glass} p-5`}>
        <h2 className="font-head text-xl font-extrabold">{t("start.pick")}</h2>
        <p className="mb-4 text-sm text-slate-300">{t("start.privacy")}</p>
        <NameField id="name-start" />
        <div className="mt-4 flex flex-wrap gap-2" role="group">
          {AVATARS.map((A, i) => (
            <button key={i} aria-pressed={i === profile.avatar} aria-label={t("start.avatar", { n: i + 1 })} onClick={() => setProfile({ avatar: i })}
              className={`grid h-14 w-14 place-items-center rounded-xl border bg-white/5 transition-all ${i === profile.avatar ? "border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,.5)]" : "border-white/15"}`}><A aria-hidden /></button>
          ))}
        </div>
        <button className={`${btnPrimary} mt-6 w-full`} onClick={() => { setProfile({ nickname: profile.nickname.trim() || randomNick(), started: true }); go("levels"); }}>{t("start.play")}<ArrowRight aria-hidden /></button>
        <p className="mt-3 text-xs text-slate-400">{t("start.local")}</p>
      </div>
    </div>
  );
}

const SLIDES = ["moon", "earth", "solar", "mars", "veggie", "iss_water"];
/** Cross-fading NASA photos behind the title. */
function Slideshow() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI(x => (x + 1) % SLIDES.length), 6000); return () => clearInterval(id); }, []);
  return (
    <AnimatePresence initial={false}>
      <motion.div key={SLIDES[i]} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
        <Photo theme={SLIDES[i]} className="absolute inset-0" kenburns />
      </motion.div>
    </AnimatePresence>
  );
}
