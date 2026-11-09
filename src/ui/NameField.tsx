import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { useStore } from "../store.ts";
import { randomNick } from "../game/logic.ts";
import { AVATARS } from "./avatars.ts";

/** Free-text player name. Stays on this device. Never asks for a real name or email. */
export function NameField({ id }: { id: string }) {
  const { t } = useTranslation();
  const { profile, setProfile } = useStore();
  const Av = AVATARS[profile.avatar] ?? AVATARS[0];
  const clean = (v: string) => v.replace(/[\u0000-\u001f<>]/g, "");
  return (
    <div>
      <label htmlFor={id} className="text-sm text-slate-300">{t("start.nameLabel")}</label>
      <div className="mt-1 flex gap-2">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/40" aria-hidden><Av /></span>
        <input id={id} value={profile.nickname} maxLength={20} autoComplete="off" spellCheck={false}
          onChange={e => setProfile({ nickname: clean(e.target.value) })}
          onBlur={() => setProfile({ nickname: profile.nickname.trim() || randomNick() })}
          className="min-h-14 min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 text-lg text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/60" />
        <button type="button" className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 hover:bg-white/10" aria-label={t("start.newName")} onClick={() => setProfile({ nickname: randomNick() })}><RefreshCw aria-hidden /></button>
      </div>
      <p className="mt-1 text-xs text-slate-400">{t("start.nameHint")}</p>
    </div>
  );
}
