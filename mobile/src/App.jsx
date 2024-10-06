import React, { useState, useRef, useEffect } from "react";
import Map from "./Map";
import Home from "./Home";
import Profile from "./Profile";
import Navbar from "./Navbar";
import ReportPopup from "./ReportPopup";
import './index.css';

function App() {
  const [activeView, setActiveView] = useState("Map");
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [reportLocation, setReportLocation] = useState(null);
  const mapRef = useRef(null);
  const [mapUpdateTrigger, setMapUpdateTrigger] = useState(0);

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleReportStart = () => {
    setIsPlacingMarker(true);
    setActiveView("Map");
  };

  const handleReportLocationSelected = (location) => {
    setReportLocation(location);
  };

  const handleReportSubmit = async (formData) => {
    try {
      const response = await fetch("http://10.0.1.17:5001/register-found-pet", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      const data = await response.json();
      console.log("Report submitted successfully:", data);

      // Reset the report state
      setReportLocation(null);
      setNearbyShelters([]);
      setIsPlacingMarker(false);
      setActiveView("Map");

      // Trigger map update
      setMapUpdateTrigger(prev => prev + 1);
  
      // Optionally, show a notification to the user
      // You can add a success notification here
    } catch (error) {
      console.error("Error submitting report:", error);
      // Handle the error, e.g., show an error message to the user
      // You can add an error notification here
    }
  };

  const handleReportCancel = () => {
    setReportLocation(null);
    setNearbyShelters([]);
    setIsPlacingMarker(false);
  };

  // Fetch nearby shelters when a report location is selected
  useEffect(() => {
    const fetchNearbyShelters = async () => {
      if (!reportLocation) return;

      const { lng, lat } = reportLocation;
      const state = 'NY'; // Adjust based on your requirements

      try {
        const response = await fetch(`http://10.0.1.17:5001/api/shelters?lat=${lat}&lng=${lng}&state=${state}`);
        const data = await response.json();
        if (data.results) {
          setNearbyShelters(data.results);
        } else {
          setNearbyShelters([]);
        }
      } catch (error) {
        console.error("Error fetching nearby shelters:", error);
        setNearbyShelters([]);
      }
    };

    fetchNearbyShelters();
  }, [reportLocation]);

  return (
    <div className="App relative h-screen w-screen overflow-hidden bg-eggshell">
      <div className="absolute inset-0">
        {activeView === "Map" && (
          <Map
            ref={mapRef}
            setNearbyShelters={setNearbyShelters}
            isPlacingMarker={isPlacingMarker}
            onReportLocationSelected={handleReportLocationSelected}
            mapUpdateTrigger={mapUpdateTrigger}
          />
        )}
        {activeView === "Home" && <Home />}
        {activeView === "Profile" && <Profile />}
      </div>
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        onReportStart={handleReportStart}
      />
      {reportLocation && nearbyShelters && (
        <ReportPopup
          onSubmit={handleReportSubmit}
          onCancel={handleReportCancel}
          nearbyShelters={nearbyShelters}
          location={reportLocation}
        />
      )}
    </div>
  );
}

export default App;