// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import MapScreen from "./components/MapScreen";
import ManageMachines from "./components/ManageMachines";

const App = () => {
  return (
    <Router>
      <div className="app-main">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/manage" element={<ManageMachines />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

