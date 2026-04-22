# Flaggquiz.se

Geography quiz app hosted at flaggquiz.se. Supports Swedish (default) and English. Built with Create React App + TypeScript.

## Commands

- `npm start` — dev server (port 3000)
- `npm run build` — production build (postbuild copies .htaccess + sitemap.txt to build/ via Node.js for cross-platform support)
- `npm test` — run tests (Jest + React Testing Library)
- `npx tsc --noEmit` — type-check without emitting

## Tech Stack

- **React 18** with TypeScript 4.9, bootstrapped with CRA
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
│   ├── useFlagQuizGame.ts    # Shared quiz logic: random country, choices, scoring
│   └── useMapZoomPan.ts      # Mouse/touch zoom+pan for map components
├── data/
│   ├── countries.json        # All country data (250 entries, sorted by Swedish name)
│   ├── countries.ts          # Data access: getAllCountries, getIndependentCountries, getCountriesByRegion
│   └── countryRegions.ts     # TopoJSON country→region mapping, Swedish/English names, projection configs
├── i18n/
│   ├── index.ts              # i18next init: LanguageDetector (localStorage only), sv fallback
│   ├── locales/sv.json       # Swedish translation strings
│   ├── locales/en.json       # English translation strings
│   ├── countryNames.ts       # Helper: country name in current language (Swedish/English)
│   ├── landskapNames.ts      # Helper: Swedish province name in current language
│   └── usStateNames.ts       # Helper: US state name in current language
├── components/
│   ├── FlagQuiz.tsx           # Main flag quiz (merged Home+FlagGuess), toggle: independent/all
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
│   └── feedback/
│       ├── FeedbackSnackbar.tsx  # MUI Snackbar+Alert for wrong answers
│       └── GameOverDialog.tsx    # MUI Dialog for game completion
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

Old English routes (`/flags`, `/write`, `/daily`, `/continents`, `/worldmap`, `/states`, `/countries`, `/about`) redirect to their Swedish equivalents via `<Navigate replace />`.

### Country Data

All country data (names, flag images, regions) is bundled locally in `src/data/countries.json` and served from `public/flags/`. No external API calls are needed — data loads synchronously on import. The data access module `src/data/countries.ts` provides three functions:
- `getAllCountries()` — all 250 countries/territories
- `getIndependentCountries()` — independent countries only
- `getCountriesByRegion(region)` — countries in a given region (with `independent`, `subregion`, `region` fields)

Country names are displayed via the `countryNames.ts` i18n helper, which returns `translations.swe.common` in Swedish mode and `name.common` in English mode.

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
- **Custom hooks** live in `src/hooks/`. `useFlagQuizGame` handles quiz state (random country, choices, score tracking); `useMapZoomPan` handles zoom/pan for map components.
- **Feedback**: Wrong answers use `FeedbackSnackbar` (auto-dismissing, severity `"error"`). Empty submissions in write-mode quizzes (FlagWrite, Daily) use severity `"info"` to prompt the user. Game completion uses `GameOverDialog`. Never use browser `alert()`.
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

`States.tsx` and `WorldMap.tsx` both use `useMapZoomPan` for zoom/pan. WorldMap has a memoized `MapGeographyLayer` sub-component for performance. The `countryRegions.ts` data file maps TopoJSON country names to regions and provides Swedish translations + projection configs per region.

`WorldMap.tsx` exports a `prefetchGeoData()` function that fetches and caches the world TopoJSON at module level. The data is fetched once on first import and passed as an object to `<Geographies>` (not as a URL), avoiding re-fetches on component remount. `RegionMapSelect` also calls `prefetchGeoData()` on mount to warm the cache while the user picks a region.

### Continent ordering

`ContinentSelect` and `RegionMapSelect` use the same continent order: Europa, Afrika, then the rest. Keep these consistent when modifying either.

### Daily quiz

Uses `seedrandom` with the current Stockholm-timezone date as seed, so all users get the same 10 countries each day.
