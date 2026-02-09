# Flaggquiz.se

Swedish geography quiz app hosted at flaggquiz.se. Built with Create React App + TypeScript.

## Commands

- `npm start` — dev server (port 3000)
- `npm run build` — production build (copies .htaccess + sitemap.txt to build/)
- `npm test` — run tests (Jest + React Testing Library)
- `npx tsc --noEmit` — type-check without emitting

## Tech Stack

- **React 18** with TypeScript 4.9, bootstrapped with CRA
- **MUI v5** (@mui/material) — all UI components, dark theme
- **react-router-dom v6** — client-side routing
- **axios** — HTTP requests to restcountries.com API
- **react-simple-maps** — SVG map rendering (world map + US states)
- **seedrandom** — deterministic daily quiz generation
- **d3-geo / topojson-client** — map projections and data

## Architecture

### Global Setup

`src/index.tsx` wraps the app in `ThemeProvider` (global dark theme from `src/theme.ts`) and `CssBaseline`. The `<Router>` lives in `src/App.tsx` and wraps everything including `PopdownMenu` so navigation uses React Router (no full-page reloads).

### File Structure

```
src/
├── types/Country.ts          # Shared Country interface (flags, name, translations)
├── theme.ts                  # Global MUI dark theme (palette.mode: 'dark', bg: #282c34)
├── hooks/
│   ├── useFlagQuizGame.ts    # Shared quiz logic: random country, choices, scoring
│   └── useMapZoomPan.ts      # Mouse/touch zoom+pan for map components
├── data/
│   └── countryRegions.ts     # TopoJSON country→region mapping, Swedish names, projection configs
├── components/
│   ├── FlagQuiz.tsx           # Main flag quiz (merged Home+FlagGuess), toggle: independent/all
│   ├── Continents.tsx         # Flag quiz filtered by continent
│   ├── FlagWrite.tsx          # Autocomplete-based flag quiz (type the answer)
│   ├── Daily.tsx              # 10-question daily quiz (seeded by date)
│   ├── WorldMap.tsx           # Interactive world map quiz (+ WorldMapRegion export)
│   ├── States.tsx             # US states map quiz
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
├── us-states.json             # US states TopoJSON geometry
├── App.css                    # Global styles (content layout, pulseRed keyframes)
└── index.css                  # Body font, emoji font class, states-container responsive
```

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `FlagQuiz mode="independent"` | Flag quiz — independent countries only |
| `/flags` | `FlagQuiz mode="all"` | Flag quiz — all countries & regions |
| `/write` | `FlagWrite` | Type-the-answer quiz |
| `/daily` | `Daily` | Seeded daily 10-question quiz |
| `/continents` | `ContinentSelect` | Continent picker |
| `/continents/:region` | `Continents` | Flag quiz for a continent |
| `/worldmap` | `WorldMap` | Full world map quiz |
| `/worldmap/regions` | `RegionMapSelect` | Region picker for map quiz |
| `/worldmap/:region` | `WorldMapRegion` | Regional map quiz |
| `/states` | `States` | US states map quiz |
| `/countries` | `Countries` | Searchable country/flag table |
| `/about` | `About` | About page |

### External API

All flag quiz data comes from **restcountries.com v3.1**:
- `GET /v3.1/independent?status=true&fields=name,flags,translations` — independent countries
- `GET /v3.1/all?fields=name,flags,translations` — all countries & regions
- `GET /v3.1/region/{region}?fields=name,flags,translations,independent` — by continent

Country names are displayed using `translations.swe.common` (Swedish).

World map TopoJSON is loaded from `cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json`.

## Conventions

### Language

- All user-facing text is in **Swedish**
- HTML lang is `sv`
- Variable names and code comments are in English

### Patterns

- **Shared types** live in `src/types/`. The `Country` interface is the main data shape.
- **Custom hooks** live in `src/hooks/`. `useFlagQuizGame` handles quiz state (random country, choices, score tracking); `useMapZoomPan` handles zoom/pan for map components.
- **Feedback**: Wrong answers use `FeedbackSnackbar` (auto-dismissing). Game completion uses `GameOverDialog`. Never use browser `alert()`.
- **Loading/error**: All API-fetching components use `loading`/`error` state → render `LoadingSpinner` or `ErrorMessage` with retry.
- **Score display**: Use `ScoreDisplay` component for consistent score presentation.
- **Selection grids**: Use `SelectGrid` for continent/region picker screens.
- **Styling**: Use MUI `sx` prop and `Typography` variants. Avoid raw HTML tags (`<p>`, `<h1>`) for text. Theme handles dark mode colors — don't hardcode `color: '#fff'` or `backgroundColor: '#282c34'` in components.
- **Flag images**: Always constrain with `maxWidth: '320px', width: '100%', height: 'auto', borderRadius: '4px'`.
- **CSS animations**: `pulseRed` keyframes live in `App.css` (not inline `<style>` blocks).
- **Emoji font**: Use `className="emoji"` for emoji text to apply Noto Color Emoji font.

### Countries page

`Countries.tsx` adds `content--scroll` class to `.content` on mount (switches from centered flex to scrollable layout). This is the only component that does this.

### Map components

`States.tsx` and `WorldMap.tsx` both use `useMapZoomPan` for zoom/pan. WorldMap has a memoized `MapGeographyLayer` sub-component for performance. The `countryRegions.ts` data file maps TopoJSON country names to regions and provides Swedish translations + projection configs per region.

### Daily quiz

Uses `seedrandom` with the current Stockholm-timezone date as seed, so all users get the same 10 countries each day.
