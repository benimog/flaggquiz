import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PopdownMenu from "./components/PopdownMenu";
import Countries from "./components/Countries";
import FlagGuess from "./components/FlagGuess";
import FlagWrite from "./components/FlagWrite";
import Home from "./components/Home";
import About from "./components/About";
import Daily from "./components/Daily";
import DailyResult from "./components/DailyResult";
import ContinentSelect from "./components/ContinentSelect";
import Continents from "./components/Continents";
import States from "./components/States";
import WorldMap from "./components/WorldMap";
import { WorldMapRegion } from "./components/WorldMap";
import RegionMapSelect from "./components/RegionMapSelect";

function App() {
  return (
    <div className="App">
      <div className="top-container">
        <PopdownMenu />
      </div>
      <div className="content">
        <Router>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/countries" Component={Countries} />
            <Route path="/flags" Component={FlagGuess} />
            <Route path="/write" Component={FlagWrite} />
            <Route path="/about" Component={About} />
            <Route path="/daily" Component={Daily} />
            <Route path="/dailyresult" Component={DailyResult} />
            <Route path="/continents" Component={ContinentSelect} />
            <Route path="/continents/:region" Component={Continents} />
            <Route path="/states" Component={States} />
            <Route path="/worldmap" Component={WorldMap} />
            <Route path="/worldmap/regions" Component={RegionMapSelect} />
            <Route path="/worldmap/:region" Component={WorldMapRegion} />
          </Routes>
        </Router>
      </div>
      <div className="bottom-container"></div>
    </div>
  );
}

export default App;

