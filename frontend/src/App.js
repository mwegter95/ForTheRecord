import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Handler from "./components/Handler";
import "./App.scss";

const App = () => {
  return (
    <Router>
      <Handler />
    </Router>
  );
};

export default App;
