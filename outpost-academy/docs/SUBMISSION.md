# Space Apps 2026 submission pack (English; the form must be in English)

Challenge: **Build a Junior Astronaut Mission Trainer**
Submission window (per the 2026 event page): **Sat Nov 14, 9:00 AM to Sun Nov 15, 11:59 PM, local time**. "Submit for Judging" is final.
Re-read the 2026 *Project Submission Guide* and *Judging & Awards Guide* on spaceappschallenge.org before you submit; the pages we could read were still the 2025 versions.

## Form fields (copy and adapt)

**Project name:** Outpost Academy

**High-level summary (what, how it addresses the challenge, why it matters):**
Outpost Academy is a free browser game for kids aged 7-12. Each day the player shares a few energy blocks between air, a radiation shield, food and water to keep a Moon or Mars base alive. There is never enough for everything, so every choice has a cost, and when something goes wrong the game shows the chain of causes. The strength of the solar storm comes from real NASA DONKI solar flare data. It matters because it makes the trade-offs of real missions something a child can feel, not just read.

**Detailed description:**
- 8 levels: 5 on the Moon (first day, long lunar night, storm watch, green thumb, thirsty base) and 3 on Mars (arrival, dust storm season, red garden). One new idea per level.
- Core loop: get energy blocks, share them between machines, end the day, see what happened and why. Decisions and science questions appear between days.
- Space weather card: the class of the strongest recent flare (X strong, M medium, otherwise calm) sets how hard the storm is. The player can start any open storm level with today's weather, or replay famous real storms (2003, 2017, 2024).
- Communication delay: on Mars a call to Earth is answered only on the next sol (messages need minutes each way); on the Moon the answer is immediate.
- Mars: the player picks the sky (clear, dust haze, global dust storm like 2018); dust cuts the energy every sol. These are scenarios based on real events, not a live feed, and the game says so.
- Real astronaut-health science: the OSDR card ties the bone-loss trade-off in the game to published NASA research.
- Honest by design: every data card says whether it is live or from saved NASA records; every fact has a source link; the numbers are a teaching model, not engineering.
- For learning: bonus science questions, mini-games, stickers, a certificate, a "play together" mode with prompts for grown-ups.
- Accessible: works on phones, 10 languages (English and Ukrainian complete), light and dark theme, big text, easy-read font, less motion, read aloud, keyboard friendly.
- Tech: React 18, TypeScript, Vite, Tailwind. The simulation is pure TypeScript with automated tests; the loader for NASA data has cache and fallbacks, so the game never shows an empty card.

**NASA data used and how:**
- NASA DONKI (CCMC) solar flare records: class of the strongest recent flare sets the storm strength (live; saved archive and a list of famous real flares as fallback). https://ccmc.gsfc.nasa.gov/tools/DONKI/
- NASA APOD via api.nasa.gov: picture of the day on the levels screen (live; only NASA-owned images are shown). https://apod.nasa.gov/apod/astropix.html
- NASA Image and Video Library: photos for every level, shown with their credits. https://images.nasa.gov/
- NASA Life Support Baseline Values and Assumptions (BVAD): ratios between air, water and food needs. https://ntrs.nasa.gov/
- NASA OSDR search API: a card on the levels screen shows how many real NASA studies exist about bones in space, with links to the first three (live; the card is hidden if NASA does not answer, saved answer labelled not live). https://osdr.nasa.gov/bio/repo/
- RadLab (radiation measured on the ISS) and Mars Trek (real Mars maps): fact cards with source links. https://osdr.nasa.gov/bio/repo/ , https://visualization.osdr.nasa.gov/radlab/ , https://trek.nasa.gov/mars/
- NASA Perseverance MOXIE, NASA HRP distance hazard (message delay), NASA/JPL 2018 Mars dust storm, ISS ECLSS, Veggie: facts and Mars scenarios.

**Space agency partner and other data / tools:**
- Canadian Space Agency, Food production on the Moon and in remote areas (teaching toolkit; used for the food fact): https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/
- Mars24 Sunclock notes (NASA GISS): length of a sol.
- Code: React, i18next, Zustand, Framer Motion, Lucide icons, Tailwind CSS, Vite (all open source, MIT/ISC). Fonts: see `index.html`.
- Original code and texts: MIT license (see `LICENSE`).

**Use of AI:**
The code, game texts and translations were written with the help of the AI assistant Claude (Anthropic), then run, tested and reviewed by the team. Translations other than English and Ukrainian are machine translations and are marked as beta. No AI-generated images, video or audio are used; all photos are real NASA photos with credits. No NASA branding was created or modified.

**Verification boxes:** tick the Terms and Conditions box and "Confirm All Work is Original".

## Demo files (hosted outside the NASA site, public link, tested in a private window)
- **Video:** at most 30 s, English subtitles, no faces, names or voices of anyone under 18. Suggested timing: team + challenge (0-5 s), project name (5 s), the idea and NASA data (10-20 s: game screen, weather card), future impact and tagline (20-30 s).
- **Slides:** at most 7 slides, English: team name, member names, challenge, a picture of the project, the user experience, how open NASA data made it possible. Going over the limits makes the project ineligible for Global Judging.
- **Final project link:** the GitHub Pages site (public, no login).

## How the project answers the five judging criteria
| Criterion | Our answer |
|---|---|
| Influence | Free, no account, works on a school phone or laptop; 10 languages; a grown-up mode for classroom or home use; teaches that resources are limited and that decisions have consequences. |
| Creativity | The weather card makes today's real Sun part of the game; "replay a real storm"; the "why" chain after every bad day instead of a plain game over; Moon and Mars worlds in one loop. |
| Validity | Transparent rules; numbers are ratios from NASA BVAD; each fact has a source; live data is labelled live, archive is labelled not live; limits are stated openly (teaching model, Mars weather is scenarios). Automated tests cover the simulation, the NASA loader and the content. |
| Relevance | Matches the brief: run a Moon or Mars outpost and balance life support, radiation shielding, power and food, and experience why a mission fails or succeeds. Not too simple, not too complex: one new idea per level. |
| Presentation | One clear story for the video: share limited energy, see the storm from real NASA data, see why it went wrong. |

## Pre-submit checklist
- [ ] Final project link opens in a private window without login.
- [ ] Video and slides within limits, links public, English subtitles.
- [ ] No names, faces or voices of minors in the video, slides or screenshots (use "5 teenagers").
- [ ] Parents or the school agreed to participation of minors; under-18 participants registered by a parent.
- [ ] Sources listed on the form (this file) and the "Use of AI" box filled in.
- [ ] Check the one remaining `verify: true` source (Moon facts) in `src/data/sources.extra.ts`.
- [ ] `npm run archive` was run so the fallback is real NASA data.
