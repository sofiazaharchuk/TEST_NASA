import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Printer } from "lucide-react";
import { btnGhost, btnPrimary } from "./bits.tsx";

interface Text { title: string; awarded: string; name: string; text: string; date: string; stars: number }
const FONT = "Nunito, system-ui, sans-serif";

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = []; let cur = "";
  for (const w of text.split(" ")) { const t = cur ? `${cur} ${w}` : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
/** Draws the certificate on a canvas and returns a PNG. A picture can be saved or shared on every phone, unlike window.print(). */
async function makePng(c: Text): Promise<Blob> {
  try { await document.fonts?.ready; } catch { /* fonts API missing: system font is used */ }
  const W = 1600, H = 1130, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d"); if (!g) throw new Error("canvas unavailable");
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, "#fffbeb"); bg.addColorStop(1, "#ffffff"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#f59e0b"; g.lineWidth = 14; g.strokeRect(40, 40, W - 80, H - 80); g.lineWidth = 4; g.strokeRect(70, 70, W - 140, H - 140);
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `110px ${FONT}`; g.fillStyle = "#0f172a"; g.fillText("🚀", W / 2, 195);
  g.font = `700 34px ${FONT}`; g.fillStyle = "#b45309"; g.fillText("OUTPOST ACADEMY", W / 2, 290);
  g.font = `800 92px ${FONT}`; g.fillStyle = "#0f172a"; g.fillText(c.title, W / 2, 395);
  g.font = `600 38px ${FONT}`; g.fillStyle = "#475569"; g.fillText(c.awarded, W / 2, 495);
  let size = 120; g.font = `800 ${size}px ${FONT}`;
  while (g.measureText(c.name).width > W - 320 && size > 48) { size -= 6; g.font = `800 ${size}px ${FONT}`; }
  g.fillStyle = "#4338ca"; g.fillText(c.name, W / 2, 610);
  g.font = `500 44px ${FONT}`; g.fillStyle = "#0f172a";
  wrap(g, c.text, W - 320).forEach((line, i) => g.fillText(line, W / 2, 735 + i * 60));
  g.font = `70px ${FONT}`; g.fillText("⭐".repeat(Math.max(1, c.stars)), W / 2, 905);
  g.font = `500 32px ${FONT}`; g.fillStyle = "#475569"; g.fillText(c.date, W / 2, 1005);
  return new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error("png failed"))), "image/png"));
}

/** "Junior Astronaut" certificate. Main action: save as a picture (works on phones, in Telegram/Instagram browsers too). Print is secondary. */
export function Certificate({ name, level, stars, onClose }: { name: string; level: string; stars: number; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(false), [failed, setFailed] = useState(false), [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const date = new Date().toLocaleDateString(i18n.language);
  const text: Text = { title: t("cert.title"), awarded: t("cert.awarded"), name, text: t("cert.text", { level }), date, stars };
  const save = async () => {
    setBusy(true); setFailed(false);
    try {
      const blob = await makePng(text), file = new File([blob], `junior-astronaut-${name.replace(/[^\p{L}\p{N}]+/gu, "-")}.png`, { type: "image/png" });
      setPreview(URL.createObjectURL(blob)); // always shown, so a long-press on the picture can save it even where downloads are blocked
      if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: text.title }); } catch { /* cancelled */ } }
      else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); }
    } catch { setFailed(true); } finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-40 overflow-auto bg-slate-950/80 p-4">
      <div className="mx-auto w-full max-w-2xl py-4">
        <div id="certificate" role="dialog" aria-modal="true" aria-label={t("cert.title")} className="rounded-3xl border-[10px] border-double border-amber-500 bg-gradient-to-br from-amber-50 to-white p-6 text-center text-slate-900 shadow-2xl sm:p-10">
          <p className="text-5xl" aria-hidden>🚀</p>
          <p className="mt-2 font-head text-sm font-bold uppercase tracking-[.3em] text-amber-700">Outpost Academy</p>
          <h2 className="mt-3 font-head text-3xl font-extrabold sm:text-4xl">{text.title}</h2>
          <p className="mt-4 text-slate-600">{text.awarded}</p>
          <p className="my-2 break-words font-head text-3xl font-extrabold text-indigo-700 sm:text-4xl">{name}</p>
          <p className="text-lg">{text.text}</p>
          <p className="mt-3 text-2xl" role="img" aria-label={`${stars}/3`}>{"⭐".repeat(Math.max(1, stars))}</p>
          <p className="mt-4 text-sm text-slate-600">{date}</p>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3 print:hidden">
          <button autoFocus disabled={busy} className={btnPrimary} onClick={save}><Download aria-hidden />{t(busy ? "cert.saving" : "cert.save")}</button>
          <button className={btnGhost} onClick={() => window.print()}><Printer aria-hidden />{t("cert.print")}</button>
          <button className="min-h-14 rounded-2xl border border-white/30 bg-slate-900/80 px-5 font-medium text-white" onClick={onClose}>{t("cert.close")}</button>
        </div>
        {failed && <p role="alert" className="mt-3 rounded-xl bg-rose-500/20 p-3 text-center text-rose-100 print:hidden">{t("cert.failed")}</p>}
        {preview && (
          <div className="mt-4 rounded-2xl bg-slate-900/90 p-3 text-center text-white print:hidden" aria-live="polite">
            <p className="mb-2 text-sm">{t("cert.hold")}</p>
            <img src={preview} alt={text.title} className="w-full rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}
