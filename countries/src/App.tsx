import React from "react";
import "./App.css";
import PopdownMenu from "./components/PopdownMenu";
import Countries from "./components/Countries";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FlagGuess from "./components/FlagGuess";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <div className="top-container">
        <PopdownMenu />
      </div>
      <header className="App-header" style={{ paddingTop: "80px"}}>
        <Router>
          <Routes>
            <Route path="/" Component={Home} />
            <Route path="/countries" Component={Countries} />
            <Route path="/flags" Component={FlagGuess} />
          </Routes>
        </Router>
      </header>
    </div>
  );
}

export default App;
