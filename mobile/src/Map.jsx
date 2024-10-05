import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { v4 as uuidv4 } from "uuid";
import { FaSearch, FaPaw } from "react-icons/fa";
import ReportPopup from "./ReportPopup";

const Map = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [draggingPin, setDraggingPin] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newMarker, setNewMarker] = useState(null);

  mapboxgl.accessToken =
    "pk.eyJ1Ijoid2lsbHk5MjAzMDUiLCJhIjoiY20xdTdkZWZyMGI0YTJsb2d6d3YxcGdtaiJ9.ZDORFIzrPgzd8bDfuemB4Q";

  useEffect(() => {
    const initializeMap = ({ setMap, mapContainerRef }) => {
      const defaultCoordinates = [-74.5, 40];

      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: defaultCoordinates,
        zoom: 9,
      });

      // Add navigation control (the +/- zoom buttons)
      mapInstance.addControl(new mapboxgl.NavigationControl(), "top-left");

      // Add geolocate control to the map
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
      });

      mapInstance.addControl(geolocate);

      // Trigger geolocation on map load
      mapInstance.on("load", () => {
        geolocate.trigger();
        setMap(mapInstance);
      });
    };

    if (!map) initializeMap({ setMap, mapContainerRef });

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  const addMarker = (e) => {
    if (draggingPin) {
      const { lng, lat } = e.lngLat;
      const newMarker = {
        id: uuidv4(),
        lng,
        lat,
        petType: draggingPin,
      };

      setNewMarker(newMarker);
      setShowPopup(true);
      setDraggingPin(null);
    }
  };

  useEffect(() => {
    if (map) {
      map.on("click", addMarker);
      return () => {
        map.off("click", addMarker);
      };
    }
  }, [map, draggingPin]);

  const handleSubmit = (reportData) => {
    const markerData = {
      ...newMarker,
      ...reportData,
    };

    setMarkers([...markers, markerData]);
    setShowPopup(false);
    setNewMarker(null);
  };

  useEffect(() => {
    if (map) {
      markers.forEach((marker) => {
        if (!map.getLayer(`marker-${marker.id}`)) {
          const el = document.createElement("div");
          el.className = "marker";
          el.style.backgroundColor =
            marker.petType === "found" ? "#4CAF50" : "#FF5722";
          el.style.width = "30px";
          el.style.height = "30px";
          el.style.borderRadius = "50%";
          el.style.display = "flex";
          el.style.justifyContent = "center";
          el.style.alignItems = "center";
          el.innerHTML =
            marker.petType === "found"
              ? '<i class="fas fa-paw" style="color: white;"></i>'
              : '<i class="fas fa-search" style="color: white;"></i>';

          new mapboxgl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .addTo(map);
        }
      });
    }
  }, [markers, map]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0" />
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          className="bg-orange-500 text-white p-3 rounded-full shadow-lg flex items-center"
          onMouseDown={() => setDraggingPin("lost")}
        >
          <FaSearch className="text-xl mr-2" />
          <span>Lost</span>
        </button>
        <button
          className="bg-green-500 text-white p-3 rounded-full shadow-lg flex items-center"
          onMouseDown={() => setDraggingPin("found")}
        >
          <FaPaw className="text-xl mr-2" />
          <span>Found</span>
        </button>
      </div>
      {showPopup && (
        <ReportPopup
          petType={newMarker.petType}
          onSubmit={handleSubmit}
          onCancel={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default Map;
