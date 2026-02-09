import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PopdownMenu from "./components/PopdownMenu";
import Countries from "./components/Countries";
import FlagQuiz from "./components/FlagQuiz";
import FlagWrite from "./components/FlagWrite";
import About from "./components/About";
import Daily from "./components/Daily";
import ContinentSelect from "./components/ContinentSelect";
import Continents from "./components/Continents";
import States from "./components/States";
import WorldMap from "./components/WorldMap";
import { WorldMapRegion } from "./components/WorldMap";
import RegionMapSelect from "./components/RegionMapSelect";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="top-container">
          <PopdownMenu />
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<FlagQuiz mode="independent" />} />
            <Route path="/flags" element={<FlagQuiz mode="all" />} />
            <Route path="/countries" Component={Countries} />
            <Route path="/write" Component={FlagWrite} />
            <Route path="/about" Component={About} />
            <Route path="/daily" Component={Daily} />
            <Route path="/continents" Component={ContinentSelect} />
            <Route path="/continents/:region" Component={Continents} />
            <Route path="/states" Component={States} />
            <Route path="/worldmap" Component={WorldMap} />
            <Route path="/worldmap/regions" Component={RegionMapSelect} />
            <Route path="/worldmap/:region" Component={WorldMapRegion} />
          </Routes>
        </div>
        <div className="bottom-container"></div>
      </div>
    </Router>
  );
}

export default App;
