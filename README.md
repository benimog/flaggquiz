# Flaggquiz.se

Swedish geography quiz app hosted at [flaggquiz.se](https://flaggquiz.se).

## Game Modes

**Flag quizzes**
- **Flaggquiz** — Guess the country from its flag (multiple choice)
- **Skrivlage** — Type the country name yourself
- **Daglig** — 10 new flags every day (same for all players)
- **Varldsdel** — Flag quiz filtered by continent

**Map quizzes**
- **Varldskarta** — Click the correct country on a world map
- **Svenska landskap** — Click the correct Swedish province
- **Amerikanska stater** — Click the correct US state

**Other**
- **Lander & regioner** — Searchable table of all countries and flags

## Tech Stack

- React 18 + TypeScript, bootstrapped with Create React App
- MUI v5 for UI components (dark theme)
- react-simple-maps for interactive SVG maps
- Country data from [restcountries.com](https://restcountries.com/) API

## Development

```bash
cd countries
npm install
npm start       # dev server on http://localhost:3000
npm run build   # production build
npm test        # run tests
```

## License

Country data from [REST Countries](https://restcountries.com/). Swedish provinces GeoJSON from [perliedman/svenska-landskap](https://github.com/perliedman/svenska-landskap) (CC0).
