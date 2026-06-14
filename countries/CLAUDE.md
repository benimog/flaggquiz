# Flaggquiz.se

Geography quiz app hosted at flaggquiz.se. Supports Swedish (default) and English. Built with Vite + TypeScript.

## Commands

- `npm start` — dev server (port 3000)
- `npm run build` — production build (postbuild copies .htaccess + sitemap.txt to build/ via Node.js for cross-platform support)
- `npm test` — run tests (Vitest + React Testing Library)
- `npx tsc --noEmit` — type-check without emitting

## Tech Stack

- **React 18** with TypeScript 5.9, built with Vite 6
- **MUI v5** (@mui/material) — all UI components, dark theme
- **react-router-dom v6** — client-side routing
- **react-simple-maps** — SVG map rendering (world map + US states)
- **react-i18next / i18next** — Swedish/English UI translations; language persisted in `localStorage` (`flaggquiz.lang`)
- **i18next-browser-languagedetector** — reads `localStorage` only (browser language intentionally ignored)
- **seedrandom** — deterministic daily quiz generation
- **d3-geo / topojson-client** — map projections and data

## Architecture

### Global Setup

`src/index.tsx` wraps the app in `ThemeProvider` (global dark theme from `src/theme.ts`) and `CssBaseline`. The `<Router>` lives in `src/App.tsx` and wraps everything including `PopdownMenu` so navigation uses React Router (no full-page reloads). All route components are lazy-loaded with `React.lazy()` + `<Suspense>` for code splitting (initial bundle ~99KB gzipped; heavy map chunks load on demand).

`src/App.tsx` imports `./i18n` at the top level to initialize react-i18next before any component renders. It also syncs `<html lang>` to `"sv"` or `"en"` whenever the language changes via an `i18n.on("languageChanged", …)` listener.

### File Structure

```
src/
├── types/Country.ts          # Shared Country interface (flags, name, translations)
├── theme.ts                  # Global MUI dark theme (palette.mode: 'dark', bg: #282c34)
├── hooks/
│   ├── useFlagQuizGame.ts    # Shared multiple-choice quiz logic: shuffled deck (each country once), choices, scoring, game over; practice flag = never-ending
│   ├── useMapQuizGame.ts     # Shared map quiz logic: shuffled targets, scoring, skip reveal, game over
│   └── useMapZoomPan.ts      # Mouse/touch zoom+pan for map components
├── utils/
│   ├── shuffle.ts            # Fisher-Yates shuffle (use this, never sort(() => Math.random() - 0.5))
│   └── stockholmDate.ts      # Stockholm-timezone date parts + daily quiz seed
├── data/
│   ├── countries.json        # All country data (250 entries, sorted by Swedish name)
│   ├── countries.ts          # Data access: getAllCountries, getIndependentCountries, getCountriesByRegion
│   └── countryRegions.ts     # TopoJSON country→region mapping, Swedish/English names, projection configs
├── i18n/
│   ├── index.ts              # i18next init: LanguageDetector (localStorage only), sv fallback
│   ├── locales/sv.json       # Swedish translation strings
│   ├── locales/en.json       # English translation strings
│   ├── countryNames.ts       # Helper: country name in current language (Swedish/English)
│   ├── capitalNames.ts       # Helper: capital name in current language (Swedish/English)
│   ├── landskapNames.ts      # Helper: Swedish province name in current language
│   └── usStateNames.ts       # Helper: US state name in current language
├── components/
│   ├── FlagQuiz.tsx           # Main flag quiz (merged Home+FlagGuess), toggle: independent/all
│   ├── ReverseFlagQuiz.tsx    # Reverse quiz: country name shown, pick the right flag
│   ├── CapitalQuiz.tsx        # Capital quiz, direction toggle: country→capital / capital→country
│   ├── PopulationQuiz.tsx     # Population higher/lower streak game (best streak in localStorage)
│   ├── Continents.tsx         # Flag quiz filtered by continent
│   ├── FlagWrite.tsx          # Autocomplete-based flag quiz (type the answer)
│   ├── Daily.tsx              # 10-question daily quiz (seeded by date)
│   ├── WorldMap.tsx           # Interactive world map quiz (+ WorldMapRegion export)
│   ├── States.tsx             # US states map quiz
│   ├── Landskap.tsx           # Swedish provinces (landskap) map quiz
│   ├── Countries.tsx          # Searchable table of all countries/flags
│   ├── ContinentSelect.tsx    # Continent picker → /continents/:region
│   ├── RegionMapSelect.tsx    # Region picker → /worldmap/:region
│   ├── PopdownMenu.tsx        # App bar with hamburger menu (uses useNavigate)
│   ├── About.tsx              # About page with game mode links
│   ├── SelectGrid.tsx         # Reusable selection button grid
│   ├── ScoreDisplay.tsx       # Standardized correct/incorrect display + reset
│   ├── LoadingSpinner.tsx     # Centered CircularProgress + "Laddar..."
│   ├── ErrorMessage.tsx       # Error state with retry button
│   ├── NotFound.tsx           # 404 page (catch-all route)
│   └── feedback/
│       ├── FeedbackSnackbar.tsx  # MUI Snackbar+Alert for wrong answers
│       └── GameOverDialog.tsx    # MUI Dialog for game completion (optional shareText → "Copy result" button)
├── states.json                # US state names list
├── us-states.json             # US states TopoJSON geometry (local)
├── landskap.json              # Swedish province names list
├── svenska-landskap.json      # Swedish provinces GeoJSON geometry (local)
```

```
public/
├── flags/                     # ~250 flag PNG images (320px wide, served locally)
├── world-countries.json       # World TopoJSON (modified: Crimea → Ukraine)
```

```
src/
├── App.css                    # Global styles (content layout, pulseRed keyframes)
├── index.css                  # Body font, emoji font class, states-container responsive
```

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `FlagQuiz mode="independent"` | Flag quiz — independent countries only |
| `/flaggor` | `FlagQuiz mode="all"` | Flag quiz — all countries & regions |
| `/hitta-flaggan` | `ReverseFlagQuiz` | Reverse quiz: pick the flag for a country |
| `/huvudstader` | `CapitalQuiz` | Capital quiz (independent countries, both directions) |
| `/befolkning` | `PopulationQuiz` | Population higher/lower streak game |
| `/skriv` | `FlagWrite` | Type-the-answer quiz |
| `/daglig` | `Daily` | Seeded daily 10-question quiz |
| `/varldsdelar` | `ContinentSelect` | Continent picker |
| `/varldsdelar/:region` | `Continents` | Flag quiz for a continent |
| `/varldskarta` | `WorldMap` | Full world map quiz |
| `/varldskarta/regioner` | `RegionMapSelect` | Region picker for map quiz |
| `/varldskarta/:region` | `WorldMapRegion` | Regional map quiz |
| `/landskap` | `Landskap` | Swedish provinces map quiz |
| `/stater` | `States` | US states map quiz |
| `/lander` | `Countries` | Searchable country/flag table |
| `/om` | `About` | About page |

Old English routes (`/flags`, `/write`, `/daily`, `/continents`, `/worldmap`, `/states`, `/countries`, `/about`) redirect to their Swedish equivalents via `<Navigate replace />`. Unknown paths render `NotFound` (catch-all `*` route); invalid region slugs redirect to the corresponding picker. The valid slugs live in `countryRegions.ts` (`regionSlugs`, `isRegionSlug`).

`PageTitle` in `App.tsx` sets a localized per-route `document.title` based on the first URL segment.

### Country Data

All country data (names, flag images, regions) is bundled locally in `src/data/countries.json` and served from `public/flags/`. No external API calls are needed — data loads synchronously on import. The data access module `src/data/countries.ts` provides three functions:
- `getAllCountries()` — all 250 countries/territories
- `getIndependentCountries()` — independent countries only (195: UN members + Vatican + Kosovo)
- `getCountriesByRegion(region)` — countries in a given region (with `independent`, `subregion`, `region` fields)
- `getCountriesWithPopulation()` — independent countries with a known `population`, sorted descending (population higher/lower game)
- `getSubregion(country)` — the country's subregion by English common name; used as the hard-mode distractor grouping key
- `getIndependentCountriesByContinent(slug)` — independent countries for a continent slug; splits "Americas" into North/South America via subregions (note: the data uses subregion `"North America"`, not REST Countries' `"Northern America"`)

Data invariants (names, region coverage, flag paths) are guarded by `src/data/*.test.ts` — extend those tests when changing the data files.

Country names are displayed via the `countryNames.ts` i18n helper, which returns `translations.swe.common` in Swedish mode and `name.common` in English mode. Capitals work the same way via `capitalNames.ts`: the data has `capital` (English, from REST Countries, first entry for multi-capital countries like South Africa) and `capitalSwe` (Swedish exonym where it differs, e.g. Köpenhamn, Peking, Helsingfors). All 195 independent countries have capitals; four territories (aq, bv, hm, mo) have none, so the capital quiz filters on `c.capital`.

Every country also has an optional `population` field (latest figures from the World Bank `SP.POP.TOTL` indicator; Vatican City is hardcoded since the World Bank doesn't track it). All 195 independent countries have a population; 22 territories also do. The population higher/lower game uses `getCountriesWithPopulation()`.

World map TopoJSON is served locally from `public/world-countries.json`. This is a modified version of `world-atlas@2/countries-110m.json` with Crimea's geometry reassigned from Russia to Ukraine. The file was generated by extracting Crimea (polygon at bbox 32.5-36.5 lon, 44.4-46.2 lat) from Russia's MultiPolygon (ISO 643) and adding it to Ukraine (ISO 804).

## Conventions

### Language

- The app supports **Swedish** (default) and **English**, selectable via a SV/EN toggle in `PopdownMenu`
- Language preference is persisted in `localStorage` under the key `flaggquiz.lang`; Swedish is always the default (browser language is intentionally not used for detection)
- All user-facing strings must go through the i18n system: use `useTranslation()` and `t("key")` — never hardcode Swedish or English UI text in components
- Country, province, and state names are translated via the helpers in `src/i18n/` (`countryNames.ts`, `landskapNames.ts`, `usStateNames.ts`)
- HTML `lang` attribute is updated to `"sv"` or `"en"` on language change (handled in `App.tsx`)
- Variable names and code comments remain in English

### Patterns

- **Shared types** live in `src/types/`. The `Country` interface is the main data shape.
- **Custom hooks** live in `src/hooks/`. `useFlagQuizGame` handles multiple-choice quiz state (deck order, choices, score tracking, game over); `useMapZoomPan` handles zoom/pan for map components. `useFlagQuizGame(countries, practice, getGroupKey?)` — when a `getGroupKey` function is supplied (hard mode, passing `getSubregion`), the three wrong choices are drawn from the answer's own subregion, falling back to the rest of the pool only if that subregion has fewer than three others.
- **Flag quiz game modes**: The four multiple-choice quizzes (`FlagQuiz`, `ReverseFlagQuiz`, `Continents`, `CapitalQuiz`) share `useFlagQuizGame`. Standard mode (default) plays the shuffled pool through once — each country appears exactly once — then shows `GameOverDialog`. Practice mode (`t("quiz.practiceMode")`, "Testläge") is the never-ending variant: it reshuffles and continues forever. Each component owns a `practice` boolean state and a `standard`/`practice` `ToggleButtonGroup`. The array passed to the hook must be referentially stable (module-level getter, module-level filter, or `useMemo`) — an inline `.filter()`/`.map()` would restart the deck every render and break standard mode. All four also own a `hard` boolean and a `normal`/`hard` `ToggleButtonGroup`; hard mode passes `getSubregion` as the hook's `getGroupKey` (and `undefined` otherwise — both referentially stable, so toggling cleanly restarts the deck). When adding a new control button, update the `controlLabels` set in the affected `*.test.tsx` so the choice-button finder still works.
- **Feedback**: Wrong answers use `FeedbackSnackbar` (auto-dismissing, severity `"error"`); correct answers show a short `"success"` snackbar (1200ms). Empty submissions in write-mode quizzes (FlagWrite, Daily) use severity `"info"` to prompt the user. Game completion uses `GameOverDialog`. Never use browser `alert()`.
- **Quiz flag alt text**: In quiz modes use the neutral `t("quiz.flagAlt")` — the descriptive `flagAlt` data names the country and would spoil the answer for screen readers. The Countries table uses the country name.
- **Shuffling**: Use `shuffle()` from `src/utils/shuffle.ts`; never `sort(() => Math.random() - 0.5)`.
- **Loading/error**: Map components that fetch remote data use `loading`/`error` state → render `LoadingSpinner` or `ErrorMessage` with retry. Flag quiz components load data synchronously from the local data module.
- **Score display**: Use `ScoreDisplay` component for consistent score presentation.
- **Selection grids**: Use `SelectGrid` for continent/region picker screens.
- **Styling**: Use MUI `sx` prop and `Typography` variants. Avoid raw HTML tags (`<p>`, `<h1>`) for text. Theme handles dark mode colors — don't hardcode `color: '#fff'` or `backgroundColor: '#282c34'` in components.
- **i18n**: Use `const { t } = useTranslation()` and `t("key")` for all user-facing text. Add new strings to both `src/i18n/locales/sv.json` and `src/i18n/locales/en.json`. For country/province/state names, use the helpers in `src/i18n/` rather than accessing the raw data field.
- **Write-mode input width**: The autocomplete input in `FlagWrite` and `Daily` is capped at `400px` on `sm+` screens and centered, to prevent the field from stretching too wide on desktop.
- **Flag images**: In quiz answer modes (FlagQuiz), use a fixed-height container (`height: 200px`, `maxWidth: 320px`, `margin: 0 auto`) with the image inside using `maxWidth/maxHeight: 100%` and `width/height: auto` for consistent button positioning. In non-quiz contexts (Countries table, Daily, FlagWrite), constrain with `maxWidth: '320px', width: '100%', height: 'auto', borderRadius: '4px'`.
- **CSS animations**: `pulseRed` keyframes live in `App.css` (not inline `<style>` blocks).
- **Emoji font**: Use `className="emoji"` for emoji text to apply Noto Color Emoji font.

### Countries page

`Countries.tsx` adds `content--scroll` class to `.content` on mount (switches from centered flex to scrollable layout). This is the only component that does this.

### Map components

`States.tsx`, `Landskap.tsx` and `WorldMap.tsx` share game logic via `useMapQuizGame` (shuffled targets, scoring, attempt-based fill colors, 2s skip reveal, game over/replay) and zoom/pan via `useMapZoomPan`. WorldMap has a memoized `MapGeographyLayer` sub-component for performance. The `countryRegions.ts` data file maps TopoJSON country names to regions and provides Swedish translations + projection configs per region. Map geometries that are not quiz targets (DC and Puerto Rico in States; out-of-region countries in WorldMap) are rendered as inert background.

`WorldMap.tsx` exports a `prefetchGeoData()` function that fetches and caches the world TopoJSON at module level. The data is fetched once on first import and passed as an object to `<Geographies>` (not as a URL), avoiding re-fetches on component remount. `RegionMapSelect` also calls `prefetchGeoData()` on mount to warm the cache while the user picks a region.

### Continent ordering

`ContinentSelect` and `RegionMapSelect` use the same continent order: Europa, Afrika, then the rest. Keep these consistent when modifying either.

### Daily quiz

Uses `seedrandom` seeded by `getDailySeed()` (`src/utils/stockholmDate.ts`), which derives the date directly from the Stockholm-formatted date string so all users worldwide get the same 10 countries each day. Don't re-parse the date string through `new Date()` — that reads back in the device timezone and breaks the shared seed (this was a real bug). The game-over dialog intentionally has no "play again" (same seed would repeat the identical quiz). The game-over dialog shows a Wordle-style **Copy result** button (`shareText` prop): an emoji grid (🟩 correct / 🟥 wrong) plus score and the `/daglig` URL. The grid is built from a locally-accumulated `results` array inside the final-answer branch — not from React state — because state updates aren't visible within the same handler tick (same reason `finalCorrect`/`finalIncorrect` are computed locally).
