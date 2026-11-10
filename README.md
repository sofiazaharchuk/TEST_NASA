# Outpost Academy - Junior Astronaut Mission Trainer

A free browser game for kids aged **7-12**. You run a small Moon base: every day you get a few **energy blocks** and decide how to share them between air, shield, food and water. Real NASA data (solar flares) changes how hard the storms are, and every mistake is explained in a "Why chain" so the child learns cause and effect.

Built for **NASA Space Apps Challenge 2026**: "Build a Junior Astronaut Mission Trainer".
Ukrainian version of this file: [README.uk.md](README.uk.md).

---

## 1. Quick start

Requirements: **Node.js 22.6+** and npm.

```bash
npm install
cp .env.example .env        # then put your free NASA key into .env (https://api.nasa.gov)
npm run photos              # download real NASA photos (needs internet, no key)
npm run archive             # save real solar-flare records for offline use (needs internet + key)
npm run dev                 # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm test` | Simulation, game logic, NASA data and content tests (plain Node, no browser) |
| `npm run build` | Type-check (`tsc`) + production build into `dist/` |
| `npm run check` | `test` + `build` (run before every push) |
| `npm run preview` | Serve the production build locally |
| `npm run photos` | Download NASA photos into `public/photos/` and write `src/data/photos.json` |
| `npm run archive` | Save real DONKI flares into `src/data/donkiArchive.json` |

**Updating from a zip?** Never overwrite your downloaded data:
`unzip -o new.zip -x 'outpost-academy/src/data/photos.json' 'outpost-academy/src/data/donkiArchive.json'`

---

## 2. Tech stack (and why)

| Layer | Choice | Why |
|---|---|---|
| UI | **React 18 + TypeScript** | Fast to build, types catch mistakes in game logic |
| Build | **Vite 5** | Instant dev server, small production bundles, code splitting |
| Styling | **Tailwind CSS 3** + a few global CSS rules (`src/styles`) | Fast, consistent, responsive utilities |
| State | **Zustand** | Tiny store, no boilerplate; saved to `localStorage` |
| Animation | **Framer Motion** (screens, cards) + **pure CSS keyframes** (weather, confetti, glow) | CSS animations use only transform/opacity, so they stay smooth on cheap phones |
| Icons | **lucide-react** | Light, consistent icon set |
| Translations | **i18next + react-i18next** | English and Ukrainian built in, other languages lazy-loaded |
| Sound | **WebAudio** (`src/lib/sfx.ts`) | No audio files to download |
| NASA data | **DONKI** (solar flares), **NASA Image and Video Library** (photos) | Free, public |
| Tests | Plain **Node** (`node --experimental-strip-types`) | The simulation has no UI, so tests need no browser |
| Hosting | Any static host (Vercel, Netlify, GitHub Pages) | No backend needed. Vercel: preset Vite, build `npm run build`, output `dist`, env `VITE_NASA_API_KEY` |

No accounts, no server, no tracking. The profile (nickname, avatar, progress, settings) is stored only on the device (`localStorage`, key `oa.v1`).

---

## 3. Project structure

```
src/
  sim/            PURE simulation (no React, no browser). The heart of the game.
    types.ts        Level, State, Move, Res...
    engine.ts       newGame, playDay, blocksToday, stars, stormThresholds
  game/           UI-independent helpers
    resume.ts       save/restore of an unfinished level (validated)
    logic.ts        blocks used/left, task checks, forecast, Why-chain, progress, status colours
    decisions.ts    Mission Control decisions + bonus science questions
  data/           DATA, not code
    levels.ts       the 5 levels (+ ACTIONS table)
    sources.ts      every fact's NASA source (+ sources.extra.ts, levelSources.ts)
    themes.ts       level -> photo theme
    photos.json     (generated) photo list with credits
    donkiArchive.json (generated) real flares; donkiBuiltin.json famous flares (last fallback)
  nasa/donki.ts   Space-weather loader with cache + fallbacks
  store.ts        Zustand store: screens, settings, progress, the current game
  screens/        Start, Levels, Intro, Game, Debrief, Settings, SpaceWeather
  ui/             ResourceCard, CoPilot (grown-up helper), Photo, WeatherFx, MiniGames, bits...
  i18n/           en.json, uk.json (complete) + es fr de pl pt tr ar hi (beta)
  lib/            sfx.ts (sound), speak.ts (read aloud), resilience.ts (chunk-error recovery)
  styles/         tokens.css (design tokens, accessibility), index.css (animations, responsive)
tests/            sim, logic, donki, content tests
tools/            download_photos.mjs, fetch_donki_archive.mjs, _net.mjs (retry helper)
```

**Rule #1:** `src/sim` and `src/game/logic.ts` must stay pure (no React, no `window`). That is why they are fully testable.
**Rule #2:** no text in code. Every sentence goes through `t("key")` and lives in `src/i18n/*.json`.

---

## 4. How the game works

### 4.1 Screen flow

```
Start (name + avatar) -> Levels -> Intro (goal, how it works) -> Game -> Debrief (stars, Why chain) -> Levels
                                         Settings can be opened from anywhere
```
`store.screen` decides which screen is shown (`src/App.tsx`). Intro, Game, Debrief and Settings are lazy-loaded chunks.

### 4.2 One day in the Game screen

1. The base gets **energy blocks**: `income[day]` (halved on a dust-storm day) + battery left from yesterday + bonus blocks.
2. The player taps **+ / -** on each machine (Air, Shield, Food, Water) and may switch on **actions** (below). Every block spent is shown as a yellow square.
3. Optional: play the **daily mini-game** (+1 block if you win, no penalty if you lose).
4. Press **End day** -> `store.endDay()` calls `playDay()` from the simulation -> a **Day report** shows what changed and why.
5. Then a **Mission Control decision** (even days) or a **bonus science question** (odd days from day 3) appears.
6. After the last day (or when all hearts are lost) the **Debrief** shows stars and the "Why chain".

### 4.3 The simulation (`src/sim/engine.ts`)

`playDay(level, state, move, weather)` is a pure function: it returns a new state and never mutates the old one.

| Rule | Effect |
|---|---|
| Blocks available | `income + battery + bonus`. Battery is capped by `level.cap`; extra blocks are **wasted** (hurts the "smart" star). |
| Air | Needs **2 blocks** a day: `+5` air. Each missing block: `-12` air. Air `<= 0` -> lose a heart. |
| Shield | `+15` per block. |
| Food | `-8` per day, `+10` per block. Food `<= 0` -> lose a heart. |
| Water | `-6` per day, `+8` per block, `-3` if food is fed. Water `<= 0` -> lose a heart. |
| Micro-meteoroid (event) | Shield `-20`. |
| Solar storm (event) | Needs shield >= `hi` to be safe, below `lo` costs 2 hearts, in between 1 heart. Thresholds come from **real space weather**: strong `[85,55]`, minor `[70,40]`, calm `[55,25]`. |
| Game end | `hearts <= 0` -> "early" end; reached the last day -> "success". |
| Stars | Safe (hearts), Smart (wasted energy), Curious (science done). |

**Actions** (each costs blocks, every one has a downside):

| Action | Cost | Effect |
|---|---|---|
| Science walk | 1 block + 10 air | +1 science (Curious star) |
| Scout drone (levels 2-5) | 2 blocks | +1 science, no air used |
| Radio Earth (levels 3-5) | 1 block | Earth gives +8 to the weakest system |
| Clean solar panels | 1 block + 8 air | +2 bonus blocks tomorrow |
| Rest | 1 block | +1 heart (if below 4) |
| Shelter drill (storm days) | 1 block | Reduces storm damage by 1 heart |

### 4.4 Levels (`src/data/levels.ts`)

Levels are **data**. Each one has: days, which resources exist, daily income (0 = lunar night), battery cap, events (type, day, warning days ahead), allowed actions and 3 tasks.

| # | Level | Days | New idea |
|---|---|---|---|
| 1 | First day | 5 | Air + shield, one meteoroid |
| 2 | Long night | 8 | 3 days with no sunlight: save energy in the battery |
| 3 | Storm watch | 8 | A solar storm: build the shield in advance |
| 4 | Green thumb | 8 | Food appears |
| 5 | Thirsty base | 8 | Water appears |

### 4.5 Decisions, questions, mini-games

- **Mission Control decisions** (`src/game/decisions.ts`): two options, each one **gains something and costs something**. A test (`tests/content.test.ts`) fails if an option is free.
- **Bonus science questions**: 4 questions with NASA-sourced answers; a right answer gives +1 block, a wrong answer teaches the fact with no penalty.
- **Mini-games** (`src/ui/MiniGames.tsx`): *Tune the shield* (timing), *Sweep the solar panels* (tap 6 dust specks in 10 s), *Match the machines* (memory). One per day, chosen by `(levelIdx + day) % 3`.

### 4.6 Real NASA data

`src/nasa/donki.ts` -> `loadFlares()` tries, in order:
1. fresh cache (under 30 min, saves the API limit)
2. **live** DONKI request (8 s timeout)
3. older cache
4. downloaded archive `src/data/donkiArchive.json` (`npm run archive`)
5. built-in list of famous real flares `src/data/donkiBuiltin.json` (date + class only)
6. "none"

The UI is always honest about the source ("live" vs "From NASA records, not live"). The strongest flare class (A/B/C/M/X) becomes the game weather (`calm / minor / strong`) which sets the storm thresholds above. DONKI sometimes answers 503; the game never shows an empty card.

### 4.7 Photos

`tools/download_photos.mjs` finds one photo per theme (`moon, earth, solar, veggie, iss_water, mars`) in the NASA Image and Video Library and stores it with its credit. `src/ui/Photo.tsx` shows it with the credit line; if `photos.json` is missing it still tries `public/photos/<theme>.jpg|png`, and if nothing loads it shows a gradient. Level -> theme map: `src/data/themes.ts`. **No photos or voices of people under 18 may be used** in the submission (Space Apps rule).

### 4.8 Screen layout and hierarchy (Game)

Look order is designed on purpose: **1)** slim mission bar (level, day, hearts) -> **2)** the big NASA photo with round vital gauges (shield, air, food, water) -> **3)** ONE highlighted instruction "Do this now" -> **4)** goals as small chips. On the right: **energy blocks** (amber) -> **base machines** -> **extra actions**. A fixed bottom bar always shows blocks left and the big "End day" button. On phones everything is one column in the same order.

### 4.9 Rewards and extras

- **Stickers** (`badgesOf` in `game/logic.ts`): derived from saved progress (`progress.won`, `progress.stars`), nothing extra stored.
- **Certificate** (`ui/Certificate.tsx`): printable / save-as-PDF "Junior Astronaut" certificate after a win.
- **Replay a real NASA storm** (Levels screen, from level 3): plays the storm level with the strength of a famous real flare (`donkiBuiltin.json`).
- **Did you know?** cards (`data/facts.ts`, `ui/FactCard.tsx`): a NASA photo + a fact with its source.

### 4.10 Animations

| Where | What | File |
|---|---|---|
| Screens | fade + slide | `App.tsx` |
| Level cards | staggered entrance | `Levels.tsx` |
| Weather over the photo | solar particles + shield ripple, dust clouds, meteors, night tint | `ui/WeatherFx.tsx` + keyframes in `index.css` |
| Win | confetti | `Debrief.tsx` |
| Buttons, bars, hearts, numbers | shine, shimmer, heartbeat, pop | classes `btn-shine`, `bar-shimmer`, `anim-beat`, `anim-pop` |
| Photos | slow "Ken Burns" zoom, cross-fade of the hero photo (storm -> the Sun, night -> Earth) | `anim-kenburns`, `Game.tsx` |

All of them are disabled by Settings -> "Less motion" and by the system `prefers-reduced-motion`.

---

## 5. Responsive design and accessibility

- **Breakpoints (Tailwind):** phone < 640 px (1 column, compact chips, avatar-only nickname), `sm` tablet portrait, `md` 2-column resource cards, `lg` (laptops, iPad landscape): **Game is two columns** (sticky photo + scene on the left, controls on the right), `xl` 3 level cards per row, 1536 px+ slightly larger base font. Content is capped at `max-w-6xl`.
- Very small phones (320 px): reduced base font, fewer particles, headers wrap instead of overflowing.
- iPhone/iPad: `viewport-fit=cover` + safe-area padding, `100dvh`, inputs >= 16 px (no zoom on focus), `touch-action: manipulation`.
- `hoverOnlyWhenSupported`: hover effects only on devices that really hover.
- `backdrop-blur` only from `md` up (cheaper on phones).
- Touch targets >= 44-56 px, visible focus ring, skip link, `aria-live` for status messages.
- Colour is never the only signal (icons + text for ok / warning / danger).
- Settings: big text, easy-read font, less motion, read aloud, sound on/off, "play together" grown-up mode (questions to ask, real science, copyable summary).

**Performance:** lazy screens (prefetched when idle), lazy languages, vendor chunks (`react`, `motion`, `i18n`, `icons`), transform/opacity-only animations, async-decoded photos.

---

## 5b. Light / dark theme

Dark is the default and the original design. Light is optional: Sun/Moon button in the header or Settings -> Theme. The choice is saved (`settings.theme`) and applied before the first paint by a tiny script in `index.html` (no flash). Implementation: `<html data-theme="light">` + `src/styles/light.css`, which remaps the dark-only Tailwind classes. **Rule:** a container with a photo behind white text gets the class `on-photo`, it stays dark in both themes. If you add a new colour class that only works on dark, add it to the generated list in `light.css` (the file header explains the pattern).

## 5c. Stability (read before deploying)

- **ErrorBoundary** (`ui/ErrorBoundary.tsx`): if any screen crashes, the player sees a friendly page with "Back to missions" instead of an empty background. The technical message is in a collapsible block, useful for bug reports.
- **Stale chunks after a redeploy** (`lib/resilience.ts`): an old open tab asks for old hashed files that no longer exist. Lazy screens are wrapped in `lazyRetry` (retry once, then one safe page reload) and `vite:preloadError` is handled. This was the cause of the "everything disappears, only the background stays" bug on Vercel.
- **Browser auto-translate crashes React.** Chrome/Google Translate rewrite the page text, then React throws `Failed to execute 'insertBefore' on 'Node'` and the screen shows the error page. Fixed with `translate="no"` + `<meta name="google" content="notranslate">` in `index.html` and a small guard in `main.tsx`. The game has its own translations, so never rely on browser translation.
- **Old devices:** no `structuredClone` (missing on older iPhones/iPads and school Chromebooks). Avoid new browser APIs without a fallback.
- **Resume:** an unfinished level is saved in `localStorage` (`run`) and restored after a refresh. `game/resume.ts` validates it and rejects anything damaged or from an older version.
- `vercel.json` sets cache headers: `index.html` never cached, `/assets/*` immutable.

## 6. Translations

- `en.json` (default and fallback) and `uk.json` are complete and reviewed. `es fr de pl pt tr ar hi` are machine translations marked **Beta**; missing keys fall back to English.
- Add a language: create `src/i18n/xx.json`, add it to `LANGUAGES` (`languages.ts`) and to `LAZY` (`i18n/index.ts`). RTL languages need `dir: "rtl"`.
- Tests check that every key used by decisions, questions, coach and mini-games exists in **en and uk**.
- Russian is intentionally not offered.

---

## 7. How to extend

| I want to... | Do this |
|---|---|
| Add a level | Add an object to `LEVELS` (`data/levels.ts`) + texts under `levels.<id>` in en/uk + a theme in `themes.ts`. No code needed. |
| Add an event type | Extend `Ev` in `sim/types.ts`, handle it in `playDay`, add a `chain.<key>` text, a forecast text and a `WeatherFx` branch; add a test in `tests/sim.test.ts`. |
| Add an action | Add a field to `Move` and `Acts`, count its cost in `used()` (`game/logic.ts`) and in `engine.ts`, add it to `Extra`, a toggle in `Game.tsx`, texts, and a test. |
| Add a decision / question | Add to `DECISIONS` / `QUIZ` (`game/decisions.ts`) + texts; `npm test` checks trade-offs, texts and sources. |
| Add a mini-game | New component in `ui/MiniGames.tsx`, extend `Mini` in `store.ts`, add texts. It must call `end(true/false)`. |
| Add a photo theme | Add a query to `THEMES` in `tools/download_photos.mjs`, run `npm run photos`. |
| Add a NASA fact | Add the source to `data/sources.ts` first (id, label, URL), then reference its id. |

---

## 8. Testing

`npm test` runs four suites without a browser: simulation (`sim`), game logic, NASA loader (cache and fallback logic with a fake `fetch`), content (translations, decision trade-offs, sources, built-in flares). The React UI has **no automated tests yet**; before a release, click through: Start -> every level -> a decision, a question, a mini-game -> Debrief, at 320 px, tablet and desktop widths, with "Less motion" on and off.

---

## 9. Deploy

`npm run build` -> upload `dist/` to Vercel / Netlify / GitHub Pages (`base: "./"`, so any sub-path works).
**GitHub Pages:** `.github/workflows/deploy.yml` builds and publishes on every push to `main`. One-time setup: repository Settings -> Pages -> Source = **GitHub Actions** (the repository must be public on a free plan). The game then lives at `https://<user>.github.io/<repo>/`. Add the NASA key as an Actions secret named `VITE_NASA_API_KEY`. The workflow runs `npm test` first, so a broken build never goes live.
**Key security:** `VITE_NASA_API_KEY` is embedded in the public JS. Use a free key you can rotate, or put the request behind a small serverless function. Never commit `.env` (it is git-ignored).

---

## 10. Hackathon rules and honesty

- Space Apps says teams must not start work on challenges before the hackathon (14-15 Nov 2026). This build was prepared in advance **with the organizers' approval; keep their written confirmation** and disclose it in the submission.
- Disclose AI assistance (Claude) in the submission, as required.
- List NASA data used: DONKI, NASA Image and Video Library, BVAD, MOXIE and other sources in `src/data/sources.ts`.
- Facts flagged `verify: true` in the sources file must be checked before submitting (they show "(verify!)" in dev mode).
- Do not show photos, video or voices of children under 18.

## 11. Known limitations / ideas

Mars levels are not built yet (`world: "mars"` is supported by the types). Offline mode / PWA is not implemented. UI has no automated tests. Beta translations need native review. The game balance is a teaching model, not an engineering simulation.
