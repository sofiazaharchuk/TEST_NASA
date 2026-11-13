// Every number and fact in the game must point to one of these. Mark anything unverified as verify: true.
export const SOURCES = [
  { id: "bvad", label: "NASA Life Support Baseline Values and Assumptions (BVAD)", url: "https://ntrs.nasa.gov/api/citations/20230013896/downloads/Logistics_BeyondLEO-ASCEND2023-Pres.pdf", use: "Crew needs per day: oxygen ~0.84-0.89 kg, water several kg, dry food ~0.6 kg. Sets RATIOS between air, water, food." },
  { id: "hrp-distance", label: "NASA HRP: Hazard Distance From Earth", url: "https://www.nasa.gov/hrp/hazard-distance-from-earth/", use: "Mars message delay up to about 20 min one way." },
  { id: "moxie", label: "NASA: Perseverance extracts first oxygen (MOXIE)", url: "https://www.nasa.gov/news-release/nasas-perseverance-mars-rover-extracts-first-oxygen-from-red-planet/", use: "5.4 g of oxygen in an hour, about 10 minutes of air for one astronaut." },
  { id: "donki", label: "NASA DONKI space weather database", url: "https://ccmc.gsfc.nasa.gov/tools/DONKI/", use: "Real solar flares, SEP events (live via the CCMC DONKI-API, archive as fallback)." },
  { id: "osdr", label: "NASA Open Science Data Repository (OSDR)", url: "https://osdr.nasa.gov/bio/repo/", use: "Public archive of NASA space biology and astronaut health research (bones, muscles, immune system, sleep). Used for the health fact." },
  { id: "radlab", label: "NASA OSDR RadLab radiation dosimetry database", url: "https://visualization.osdr.nasa.gov/radlab/", use: "Real radiation dose measurements from instruments on the International Space Station. Used for the radiation fact." },
  { id: "mars-trek", label: "NASA Mars Trek", url: "https://trek.nasa.gov/mars/", use: "Real maps, elevation and terrain of Mars from NASA missions. Used for the Mars map fact." },
  { id: "apod", label: "NASA APOD, Astronomy Picture of the Day (api.nasa.gov)", url: "https://apod.nasa.gov/apod/astropix.html", use: "Live picture of the day on the Levels screen; credit line shown as given by NASA." },
  { id: "nasa-api", label: "NASA Open APIs", url: "https://api.nasa.gov/", use: "The portal behind DONKI and APOD requests (one free key for both)." },
  { id: "csa-food", label: "Canadian Space Agency: food production on the Moon and in remote areas", url: "https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/", use: "Partner-agency teaching kit: growing food in space and in remote places on Earth. Used for the food fact." },
  { id: "mars-dust", label: "NASA/JPL: the 2018 Mars global dust storm and the Opportunity rover", url: "https://www.jpl.nasa.gov/news/nasa-encounters-the-perfect-storm-for-science", use: "Mars dust storms can grow to cover the planet; 2018 storm and Opportunity. The sky levels are scenarios, not live data." },
  { id: "sol", label: "Mars24 Sunclock technical notes on Mars solar time (NASA GISS)", url: "https://oregonl5.nss.org/mist/docs/Mars24J/help/notes.html", use: "Sol = 24 h 39 m 35 s." },
] as const;
