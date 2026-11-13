// Which NASA photo theme belongs to which level (photos are downloaded by tools/download_photos.mjs).
// Every level has its OWN picture; scenes, facts and the start slideshow use other themes, so the same photo is never shown twice.
export const LEVEL_THEME: Record<string, string> = { first_day: "moon", long_night: "earth", storm_watch: "solar", green_thumb: "veggie", thirsty_base: "iss_water", mars_arrival: "mars", mars_dust_season: "mars_dust", mars_red_garden: "mars_garden" };
