import React, { useState } from "react";
import Map from "./Map";
import Camera from "./Camera";
import Chat from "./Chat";
import Navbar from "./Navbar";

function App() {
  const [activeView, setActiveView] = useState("Map");

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  return (
    <div className="App relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0">
        {activeView === "Map" && <Map />}
        {activeView === "Camera" && <Camera />}
        {activeView === "Chat" && <Chat />}
      </div>
      <Navbar
        onMapClick={() => handleViewChange("Map")}
        onCameraClick={() => handleViewChange("Camera")}
        onChatClick={() => handleViewChange("Chat")}
      />
    </div>
  );
}

export default App;
