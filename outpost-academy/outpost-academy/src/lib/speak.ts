export function speak(text: string, lang: string) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = lang; speechSynthesis.speak(u); } catch { /* not supported */ }
}
