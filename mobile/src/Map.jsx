import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { v4 as uuidv4 } from "uuid";
import { FaPaw } from "react-icons/fa";
import ReportPopup from "./ReportPopup";
import axios from "axios"; // Make sure to install axios: npm install axios

const Map = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [draggingPin, setDraggingPin] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [foundPets, setFoundPets] = useState([]);
  const [missingPets, setMissingPets] = useState([]);

  mapboxgl.accessToken =
    "pk.eyJ1Ijoid2lsbHk5MjAzMDUiLCJhIjoiY20xdTdkZWZyMGI0YTJsb2d6d3YxcGdtaiJ9.ZDORFIzrPgzd8bDfuemB4Q";

  const fetchFoundPets = async () => {
    try {
      const response = await fetch("http://10.0.1.230:5001/found-pets");
      const data = await response.json();
      setFoundPets(data.pets);
    } catch (error) {
      console.error("Error fetching found pets:", error);
    }
  };

  const fetchMissingPets = async () => {
    try {
      const response = await fetch("http://10.0.1.230:5001/missing-pets");
      const data = await response.json();
      setMissingPets(data.pets);
    } catch (error) {
      console.error("Error fetching missing pets:", error);
    }
  };

  // Fetch found pet data
  useEffect(() => {
    fetchFoundPets();
    fetchMissingPets();
  }, []);

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

  // Add markers for found pets
  useEffect(() => {
    if (map && foundPets.length > 0) {
      foundPets.forEach((pet) => {
        if (pet.location) {
          const { longitude, latitude } = pet.location;

          // Create a DOM element for the marker
          const el = document.createElement("div");
          el.className = "found-pet-marker";
          el.style.width = "30px";
          el.style.height = "40px";
          el.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" fill="none">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#4CAF50"/>
              <circle cx="12" cy="12" r="8" fill="#FFFFFF"/>
              <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2zm0 10c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1s1 .4 1 1v2c0 .6-.4 1-1 1z" fill="#4CAF50"/>
            </svg>`
          )}')`;
          el.style.backgroundSize = "contain";
          el.style.backgroundRepeat = "no-repeat";
          el.style.backgroundPosition = "center";
          el.style.cursor = "pointer";

          // Create popup content
          const popupContent = document.createElement("div");
          popupContent.innerHTML = `
            <h3 style="color: black; font-weight: bold;">Found Pet</h3>
            <p style="color: black;"><strong>Date:</strong> ${
              pet.date || "N/A"
            }</p>
            <p style="color: black;"><strong>Shelter:</strong> ${
              pet.shelter || "N/A"
            }</p>
          `;

          // Add image to popup if available
          if (pet.pictureUrl) {
            const img = document.createElement("img");
            img.src = pet.pictureUrl;
            img.alt = "Found Pet";
            img.style.width = "100%";
            img.style.height = "auto";
            img.style.objectFit = "cover";
            img.style.borderRadius = "4px";
            img.style.marginTop = "10px";
            popupContent.appendChild(img);
          }

          // Create a popup
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: true,
          }).setDOMContent(popupContent);

          // Add marker to the map
          new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map);
        }
      });
    }
  }, [map, foundPets]);

  // Add markers for missing pets
  useEffect(() => {
    if (map && missingPets.length > 0) {
      missingPets.forEach((pet) => {
        if (pet.lastKnownLocation) {
          const { longitude, latitude } = pet.lastKnownLocation;

          // Create a DOM element for the marker
          const el = document.createElement("div");
          el.className = "missing-pet-marker";
          el.style.width = "30px";
          el.style.height = "40px";
          el.style.backgroundImage = `url('data:image/svg+xml;charset=utf-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" fill="none">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#FF5722"/>
              <circle cx="12" cy="12" r="8" fill="#FFFFFF"/>
              <path d="M12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2zm0 10c-.6 0-1-.4-1-1v-2c0-.6.4-1 1-1s1 .4 1 1v2c0 .6-.4 1-1 1z" fill="#FF5722"/>
            </svg>`
          )}')`;
          el.style.backgroundSize = "contain";
          el.style.backgroundRepeat = "no-repeat";
          el.style.backgroundPosition = "center";
          el.style.cursor = "pointer";

          // Create popup content
          const popupContent = document.createElement("div");
          popupContent.innerHTML = `
            <h3 style="color: black; font-weight: bold;">Missing Pet</h3>
            <p style="color: black;"><strong>Name:</strong> ${
              pet.name || "N/A"
            }</p>
            <p style="color: black;"><strong>Breed:</strong> ${
              pet.breed || "N/A"
            }</p>
            <p style="color: black;"><strong>Last Seen:</strong> ${
              pet.createdAt
                ? new Date(pet.createdAt).toLocaleDateString()
                : "N/A"
            }</p>
          `;

          // Add image to popup if available
          if (pet.imageUrl) {
            const img = document.createElement("img");
            img.src = pet.imageUrl;
            img.alt = "Missing Pet";
            img.style.width = "100%";
            img.style.height = "auto";
            img.style.objectFit = "cover";
            img.style.borderRadius = "4px";
            img.style.marginTop = "10px";
            popupContent.appendChild(img);
          }

          // Create a popup
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: true,
          }).setDOMContent(popupContent);

          // Add marker to the map
          new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map);
        }
      });
    }
  }, [map, missingPets]);

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

  const handleSubmit = async (reportData) => {
    const { date, shelter, picture } = reportData;
    const { lng, lat } = newMarker;

    console.log("Received report data:", reportData);

    const formData = new FormData();

    formData.append("shelter", shelter || "Unknown Shelter");

    if (!picture) {
      console.error("Picture is undefined, cannot submit form");
      alert("Please select a picture before submitting.");
      return;
    }
    formData.append("picture", picture);

    formData.append(
      "location",
      JSON.stringify({ latitude: lat, longitude: lng })
    );

    formData.append("date", date || new Date().toISOString().split("T")[0]);

    console.log("FormData entries before sending:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const response = await axios.post(
        "http://10.0.1.230:5001/register-found-pet",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        const markerData = {
          ...newMarker,
          ...reportData,
          id: response.data.petId,
          pictureCid: response.data.pictureCid,
        };

        setFoundPets([...foundPets, markerData]);
        setShowPopup(false);
        setNewMarker(null);

        alert("Found pet registered successfully!");

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 100); // 1 second delay before reload
      }
    } catch (error) {
      console.error(
        "Error registering found pet:",
        error.response?.data || error.message
      );
      alert(
        "An error occurred while registering the found pet. Please try again."
      );
    }
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
          el.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 36' fill='none'%3E%3Cpath d='M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z' fill='%234CAF50'/%3E%3Ccircle cx='12' cy='12' r='8' fill='%23FFFFFF'/%3E%3Cpath d='M12 9a3 3 0 110-6 3 3 0 010 6zm0 3c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1s1-.4 1-1v-2c0-.6-.4-1-1-1z' fill='%234CAF50'/%3E%3C/svg%3E")`;
          el.style.backgroundSize = "contain";
          el.style.backgroundRepeat = "no-repeat";
          el.style.backgroundPosition = "center";
          el.style.cursor = "pointer";

          // Create popup content
          const popupContent = document.createElement("div");
          popupContent.innerHTML = `
            <h3 style="color: black; font-weight: bold;">${
              marker.petType === "found" ? "Found Pet" : "Lost Pet"
            }</h3>
            <p style="color: black;">Date: ${marker.date || "N/A"}</p>
            <p style="color: black;">shelter: ${marker.shelter || "N/A"}</p>
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

          // Create a popup
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
        <button
          onClick={() => {
            fetchFoundPets();
            fetchMissingPets();
          }}
          className="bg-blue-500 text-white p-2 rounded-md shadow-lg flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
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
