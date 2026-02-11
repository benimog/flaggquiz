# Flaggquiz.se — countries

React app for [flaggquiz.se](https://flaggquiz.se). See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation.

## Quick Start

```bash
npm install
npm start         # dev server on localhost:3000
npm run build     # production build
npm test          # Jest + React Testing Library
npx tsc --noEmit  # type-check without emitting
```

## Tech Stack

- **React 18** + TypeScript 4.9 (Create React App)
- **MUI v5** — UI components, dark theme
- **react-router-dom v6** — client-side routing (Swedish paths)
- **react-simple-maps** — SVG map rendering
- **axios** — REST Countries API requests
- **seedrandom** — deterministic daily quiz
- **d3-geo / topojson-client** — map projections

## Routes

All routes use Swedish paths. Old English paths (`/about`, `/states`, etc.) redirect automatically.

| Path | Description |
|------|-------------|
| `/` | Flag quiz — independent countries |
| `/flaggor` | Flag quiz — all countries & regions |
| `/skriv` | Type-the-answer quiz |
| `/daglig` | Daily 10-question quiz |
| `/varldsdelar` | Continent picker |
| `/varldskarta` | World map quiz |
| `/landskap` | Swedish provinces map quiz |
| `/stater` | US states map quiz |
| `/lander` | Searchable country/flag table |
| `/om` | About page |

## Data Sources

- **Country data**: [restcountries.com](https://restcountries.com/) v3.1 API (Swedish names via `translations.swe.common`)
- **World map**: Modified `world-atlas` TopoJSON (Crimea reassigned to Ukraine), served from `public/`
- **Swedish provinces**: [perliedman/svenska-landskap](https://github.com/perliedman/svenska-landskap) GeoJSON (CC0)
- **US states**: Local TopoJSON in `src/`
