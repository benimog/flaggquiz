import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
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
const Landskap = React.lazy(() => import("./components/Landskap"));
const About = React.lazy(() => import("./components/About"));

function RedirectContinentRegion() {
  const { region } = useParams();
  return <Navigate to={`/varldsdelar/${region}`} replace />;
}

function RedirectWorldmapRegion() {
  const { region } = useParams();
  return <Navigate to={`/varldskarta/${region}`} replace />;
}

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
              <Route path="/flaggor" element={<FlagQuiz mode="all" />} />
              <Route path="/lander" element={<Countries />} />
              <Route path="/skriv" element={<FlagWrite />} />
              <Route path="/om" element={<About />} />
              <Route path="/daglig" element={<Daily />} />
              <Route path="/varldsdelar" element={<ContinentSelect />} />
              <Route path="/varldsdelar/:region" element={<Continents />} />
              <Route path="/stater" element={<States />} />
              <Route path="/landskap" element={<Landskap />} />
              <Route path="/varldskarta" element={<WorldMap />} />
              <Route path="/varldskarta/regioner" element={<RegionMapSelect />} />
              <Route path="/varldskarta/:region" element={<WorldMapRegion />} />

              {/* Redirects from old English routes */}
              <Route path="/flags" element={<Navigate to="/flaggor" replace />} />
              <Route path="/countries" element={<Navigate to="/lander" replace />} />
              <Route path="/write" element={<Navigate to="/skriv" replace />} />
              <Route path="/about" element={<Navigate to="/om" replace />} />
              <Route path="/daily" element={<Navigate to="/daglig" replace />} />
              <Route path="/continents" element={<Navigate to="/varldsdelar" replace />} />
              <Route path="/continents/:region" element={<RedirectContinentRegion />} />
              <Route path="/states" element={<Navigate to="/stater" replace />} />
              <Route path="/worldmap" element={<Navigate to="/varldskarta" replace />} />
              <Route path="/worldmap/regions" element={<Navigate to="/varldskarta/regioner" replace />} />
              <Route path="/worldmap/:region" element={<RedirectWorldmapRegion />} />
            </Routes>
          </Suspense>
        </div>
        <div className="bottom-container"></div>
      </div>
    </Router>
  );
}

export default App;
