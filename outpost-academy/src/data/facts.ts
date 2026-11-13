// "Did you know?" cards. Every fact needs a registered source (data/sources.ts). Texts live in i18n under facts.<id>.
// `theme` is a photo theme (see tools/download_photos.mjs); a missing photo falls back to a gradient.
export const FACTS = [
  { id: "oxygen", theme: "iss_cabin", source: "bvad" },
  { id: "bones", theme: "iss_cabin", source: "osdr" },
  { id: "flare", theme: "solar", source: "donki" },
  { id: "csafood", theme: "veggie", source: "csa-food" },
  { id: "radlab", theme: "solar_panels", source: "radlab" },
  { id: "trek", theme: "mars", source: "mars-trek" },
  { id: "marsdust", theme: "mars_dust", source: "mars-dust" },
  { id: "moxie", theme: "moxie", source: "moxie" },
  { id: "delay", theme: "dsn", source: "hrp-distance" },
  { id: "sol", theme: "mars", source: "sol" },
] as const;
