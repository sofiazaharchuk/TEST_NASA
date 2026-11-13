// Every number and fact in the game must point to one of these. Mark anything unverified as verify: true.
export const SOURCES = [
  { id: "bvad", label: "NASA Life Support Baseline Values and Assumptions (BVAD)", url: "https://ntrs.nasa.gov/api/citations/20230013896/downloads/Logistics_BeyondLEO-ASCEND2023-Pres.pdf", use: "Crew needs per day: oxygen ~0.84-0.89 kg, water several kg, dry food ~0.6 kg. Sets RATIOS between air, water, food." },
  { id: "hrp-distance", label: "NASA HRP: Hazard Distance From Earth", url: "https://www.nasa.gov/hrp/hazard-distance-from-earth/", use: "Mars message delay up to about 20 min one way." },
  { id: "moxie", label: "NASA: Perseverance extracts first oxygen (MOXIE)", url: "https://www.nasa.gov/news-release/nasas-perseverance-mars-rover-extracts-first-oxygen-from-red-planet/", use: "5.4 g of oxygen in an hour, about 10 minutes of air for one astronaut." },
  { id: "donki", label: "NASA DONKI space weather database", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", use: "Real solar flares, SEP events (live via api.nasa.gov, archive as fallback)." },
  { id: "osdr", label: "NASA Open Science Data Repository", url: "https://osdr.nasa.gov/", use: "Astronaut health and plant biology facts.", verify: true },
  { id: "sol", label: "NASA GISS: Telling Time on Mars", url: "", use: "Sol = 24 h 39 m 35 s.", verify: true },
] as const;
