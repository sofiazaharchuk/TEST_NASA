// English is the default. Russian is intentionally NOT offered.
// status: "complete" = translated and reviewed; "beta" = machine-translated, shown with a Beta tag until a native speaker reviews it.
export const LANGUAGES = [
  { code: "en", name: "English", status: "complete", dir: "ltr" },
  { code: "uk", name: "Українська", status: "complete", dir: "ltr" },
  { code: "es", name: "Español", status: "beta", dir: "ltr" },
  { code: "fr", name: "Français", status: "beta", dir: "ltr" },
  { code: "de", name: "Deutsch", status: "beta", dir: "ltr" },
  { code: "pl", name: "Polski", status: "beta", dir: "ltr" },
  { code: "pt", name: "Português", status: "beta", dir: "ltr" },
  { code: "tr", name: "Türkçe", status: "beta", dir: "ltr" },
  { code: "ar", name: "العربية", status: "beta", dir: "rtl" },
  { code: "hi", name: "हिन्दी", status: "beta", dir: "ltr" },
] as const;
