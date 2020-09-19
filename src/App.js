import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { bypassLink } from "./utils/bypassLinks";

function App() {
  bypassLink();
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Bypass Links. Enjoy!!!</p>
      </header>
    </div>
  );
}

export default App;
