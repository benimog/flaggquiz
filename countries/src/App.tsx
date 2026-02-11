import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PopdownMenu from "./components/PopdownMenu";
import LoadingSpinner from "./components/LoadingSpinner";

const FlagQuiz = React.lazy(() => import("./components/FlagQuiz"));
const FlagWrite = React.lazy(() => import("./components/FlagWrite"));
const Daily = React.lazy(() => import("./components/Daily"));
const ContinentSelect = React.lazy(() => import("./components/ContinentSelect"));
const Continents = React.lazy(() => import("./components/Continents"));
const Countries = React.lazy(() => import("./components/Countries"));
const States = React.lazy(() => import("./components/States"));
const WorldMap = React.lazy(() => import("./components/WorldMap"));
const WorldMapRegion = React.lazy(() =>
  import("./components/WorldMap").then(module => ({ default: module.WorldMapRegion }))
);
const RegionMapSelect = React.lazy(() => import("./components/RegionMapSelect"));
const About = React.lazy(() => import("./components/About"));

function App() {
  return (
    <Router>
      <div className="App">
        <div className="top-container">
          <PopdownMenu />
        </div>
        <div className="content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<FlagQuiz mode="independent" />} />
              <Route path="/flags" element={<FlagQuiz mode="all" />} />
              <Route path="/countries" element={<Countries />} />
              <Route path="/write" element={<FlagWrite />} />
              <Route path="/about" element={<About />} />
              <Route path="/daily" element={<Daily />} />
              <Route path="/continents" element={<ContinentSelect />} />
              <Route path="/continents/:region" element={<Continents />} />
              <Route path="/states" element={<States />} />
              <Route path="/worldmap" element={<WorldMap />} />
              <Route path="/worldmap/regions" element={<RegionMapSelect />} />
              <Route path="/worldmap/:region" element={<WorldMapRegion />} />
            </Routes>
          </Suspense>
        </div>
        <div className="bottom-container"></div>
      </div>
    </Router>
  );
}

export default App;
