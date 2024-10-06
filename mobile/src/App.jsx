import React, { useState } from "react";
import Map from "./Map";
import Home from "./Home";
import Profile from "./Profile";
import Navbar from "./Navbar";
import './index.css';

function App() {
  const [activeView, setActiveView] = useState("Home");

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div className="App relative h-screen w-screen overflow-hidden bg-eggshell">
      <div className="absolute inset-0">
        {activeView === "Map" && <Map />}
        {activeView === "Home" && <Home />}
        {activeView === "Profile" && <Profile />}
      </div>
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
      />
    </div>
  );
}

export default App;
