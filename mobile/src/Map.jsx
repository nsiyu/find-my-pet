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
          // Create a DOM element for the marker
          const el = document.createElement("div");
          el.className = "custom-marker";
          el.style.width = "20px";
          el.style.height = "30px";
          el.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${
            marker.petType === "found" ? "4CAF50" : "FF5722"
          }' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E")`;
          el.style.backgroundSize = "cover";
          el.style.backgroundRepeat = "no-repeat";
          el.style.backgroundPosition = "center";

          // Create popup content
          const popupContent = document.createElement("div");
          popupContent.innerHTML = `
            <h3 style="color: black; font-weight: bold;">${
              marker.petType === "found" ? "Found Pet" : "Lost Pet"
            }</h3>
            <p style="color: black;">Date: ${marker.date || "N/A"}</p>
            <p style="color: black;">Contact: ${marker.contact || "N/A"}</p>
          `;

          // Add images to popup if available
          if (marker.images && marker.images.length > 0) {
            const imageContainer = document.createElement("div");
            imageContainer.style.display = "flex";
            imageContainer.style.flexWrap = "wrap";
            imageContainer.style.gap = "5px";
            imageContainer.style.marginTop = "10px";

            marker.images.forEach((image, index) => {
              const img = document.createElement("img");
              img.src = image;
              img.alt = `Pet image ${index + 1}`;
              img.style.width = "80px";
              img.style.height = "80px";
              img.style.objectFit = "cover";
              img.style.borderRadius = "4px";
              imageContainer.appendChild(img);
            });

            popupContent.appendChild(imageContainer);
          }

          // Create a popup without the close button, but closable on map click
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: true,
          }).setDOMContent(popupContent);

          // Add marker to the map
          new mapboxgl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .setPopup(popup)
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
