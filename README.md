# Flaggquiz.se

Geography quiz app hosted at [flaggquiz.se](https://flaggquiz.se). Supports Swedish and English (SV/EN toggle in the menu).

## Game Modes

**Flag quizzes**
- **Flaggquiz** — Guess the country from its flag (multiple choice, independent countries)
- **Flaggquiz (alla)** — All countries and regions
- **Skrivläge** — Type the country name yourself
- **Daglig** — 10 new flags every day (same for all players)
- **Världsdel** — Flag quiz filtered by continent

**Map quizzes**
- **Världskarta** — Click the correct country on a world map
- **Världskarta per världsdel** — Map quiz for a specific continent
- **Svenska landskap** — Click the correct Swedish province
- **Amerikanska stater** — Click the correct US state

**Other**
- **Länder & regioner** — Searchable table of all countries and flags

## Tech Stack

- React 18 + TypeScript, bootstrapped with Create React App
- MUI v5 for UI components (dark theme)
- react-simple-maps for interactive SVG maps
- react-i18next for Swedish/English language support
- Country data and flag images bundled locally (from [flagcdn](https://flagcdn.com/))

## Development

```bash
cd countries
npm install
npm start       # dev server on http://localhost:3000
npm run build   # production build
npm test        # run tests
```

## License

Flag images from [flagcdn](https://flagcdn.com/). Swedish provinces GeoJSON from [perliedman/svenska-landskap](https://github.com/perliedman/svenska-landskap) (CC0).
