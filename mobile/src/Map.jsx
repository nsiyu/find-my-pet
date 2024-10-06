import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { v4 as uuidv4 } from "uuid";
import { FaTimes } from "react-icons/fa";
import axios from "axios"; 
import PhotoCapture from "./PhotoCapture";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { FaBell } from "react-icons/fa";

const Map = React.forwardRef(({ isPlacingMarker, onReportLocationSelected, mapUpdateTrigger }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [foundPets, setFoundPets] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [showPlacementMessage, setShowPlacementMessage] = useState(false);
  const [missingPets, setMissingPets] = useState([]);

  mapboxgl.accessToken =
    "pk.eyJ1Ijoid2lsbHk5MjAzMDUiLCJhIjoiY20xdTdkZWZyMGI0YTJsb2d6d3YxcGdtaiJ9.ZDORFIzrPgzd8bDfuemB4Q";

  const fetchFoundPets = async () => {
    try {
      const response = await fetch("http://10.0.1.17:5001/found-pets");
      const data = await response.json();
      console.log(data);
      setFoundPets(data.pets.map(pet => ({
        ...pet,
        pictureUrl: pet.pictureUrl || null
      })));
    } catch (error) {
      console.error("Error fetching found pets:", error);
    }
  };

  const fetchMissingPets = async () => {
    try {
      const response = await fetch("http://10.0.1.17:5001/missing-pets");
      const data = await response.json();
      setMissingPets(data.pets);
    } catch (error) {
      console.error("Error fetching missing pets:", error);
    }
  };

  const fetchNearbyShelters = async () => {
    if (!userLocation) return;

    const [lng, lat] = userLocation;
    const state = 'NY'; 

    try {
      const response = await fetch(`http://10.0.1.17:5001/api/shelters?lat=${lat}&lng=${lng}&state=${state}`);
      const data = await response.json();
      if (data.results) {
        setNearbyShelters(data.results);
      }
    } catch (error) {
      console.error("Error fetching nearby shelters:", error);
    }
  };

  useEffect(() => {
    fetchFoundPets();
    fetchMissingPets();
  }, [mapUpdateTrigger]);

  useEffect(() => {
    const initializeMap = ({ setMap, mapContainerRef }) => {
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 0],
        zoom: 2,
        attributionControl: false,
        logoPosition: 'bottom-left'
      });

      const nav = new mapboxgl.NavigationControl();
      mapInstance.addControl(nav, 'top-right');

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false,
        showUserHeading: false,
        showAccuracyCircle: false,
      });

      mapInstance.addControl(geolocate);

      mapInstance.on('load', () => {
        geolocate.trigger();
        setMap(mapInstance);

        // Adjust the map colors to better match the app's theme
        mapInstance.setPaintProperty('land', 'background-color', '#f0ede5');
        mapInstance.setPaintProperty('water', 'fill-color', '#c8d7e5');
        mapInstance.setPaintProperty('road', 'line-color', '#e0d8c8');
        mapInstance.setPaintProperty('building', 'fill-color', '#e8e0d5');
      });

      geolocate.on('geolocate', (e) => {
        const lon = e.coords.longitude;
        const lat = e.coords.latitude;
        const position = [lon, lat];
        setUserLocation(position);
        mapInstance.jumpTo({ center: position, zoom: 14 });
        geolocate.off('geolocate'); // Remove the event listener after first use
      });

      // Add attribution control to the bottom left
      mapInstance.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
    };

    if (!map) initializeMap({ setMap, mapContainerRef });

    return () => {
      if (map) map.remove();
    };
  }, [map]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyShelters();
    }
  }, [userLocation]);

  useEffect(() => {
    if (map && foundPets.length > 0) {
      foundPets.forEach((pet) => {
        const { longitude, latitude } = pet.location;
        const el = document.createElement("div");
        el.className = "found-pet-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.backgroundImage = `url(${pet.pictureUrl || 'default-pet-image.jpg'})`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid #81b29a";
        el.style.cursor = "pointer";

        const popupContent = document.createElement("div");
        popupContent.className = "bg-eggshell p-4 rounded-lg shadow-md";
        popupContent.innerHTML = `
          <h3 class="text-xl font-bold text-delft-blue mb-2">Found Pet</h3>
          <img src="${pet.pictureUrl || 'default-pet-image.jpg'}" alt="Found Pet" class="w-full h-32 object-cover rounded-md mb-2">
          <p class="text-burnt-sienna"><strong>Date:</strong> ${pet.date || "N/A"}</p>
          <p class="text-burnt-sienna"><strong>Shelter:</strong> ${pet.shelter || "N/A"}</p>
          <p class="text-burnt-sienna"><strong>Found by:</strong> Li Shen</p>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          maxWidth: "300px",
          className: "custom-popup",
        }).setDOMContent(popupContent);

        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);
      });
    }
  }, [map, foundPets]);

  useEffect(() => {
    if (map && missingPets.length > 0) {
      missingPets.forEach((pet) => {
        const { longitude, latitude } = pet.lastKnownLocation;
        const el = document.createElement("div");
        el.className = "missing-pet-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.backgroundImage = `url(${pet.imageUrl || 'default-pet-image.jpg'})`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid #e07a5f";
        el.style.cursor = "pointer";

        const popupContent = document.createElement("div");
        popupContent.className = "bg-eggshell p-4 rounded-lg shadow-md";
        popupContent.innerHTML = `
          <h3 class="text-xl font-bold text-delft-blue mb-2">Missing Pet</h3>
          <img src="${pet.imageUrl || 'default-pet-image.jpg'}" alt="Missing Pet" class="w-full h-32 object-cover rounded-md mb-2">
          <p class="text-burnt-sienna"><strong>Name:</strong> ${pet.name}</p>
          <p class="text-burnt-sienna"><strong>Breed:</strong> ${pet.breed}</p>
          <p class="text-burnt-sienna"><strong>Last seen:</strong> ${new Date(pet.lastSeenDate).toLocaleDateString()}</p>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          maxWidth: "300px",
          className: "custom-popup",
        }).setDOMContent(popupContent);

        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);
      });
    }
  }, [map, missingPets]);

  useEffect(() => {
    if (map && nearbyShelters.length > 0) {
      nearbyShelters.forEach((shelter) => {
        const { lat, lng } = shelter.geometry.location;
        
        const el = document.createElement("div");
        el.className = "shelter-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.backgroundImage = "url('https://img.icons8.com/color/48/000000/animal-shelter.png')";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid #3FB1CE";
        el.style.cursor = "pointer";

        const popupContent = document.createElement("div");
        popupContent.innerHTML = `
          <h3 style="color: black; font-weight: bold;">${shelter.name}</h3>
          <p style="color: black;">${shelter.vicinity}</p>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: true,
        }).setDOMContent(popupContent);

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      });
    }
  }, [map, nearbyShelters]);

  useEffect(() => {
    if (map && isPlacingMarker) {
      const handleMapClick = (e) => {
        onReportLocationSelected(e.lngLat);
      };

      map.on('click', handleMapClick);

      setShowPlacementMessage(true);

      return () => {
        map.off('click', handleMapClick);
        setShowPlacementMessage(false);
      };
    }
  }, [map, isPlacingMarker, onReportLocationSelected]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("location", JSON.stringify(reportLocation));
    // Handle form submission logic here
    try {
      await axios.post("http://10.0.1.17:5001/report-pet", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Refresh pets data after successful submission
      fetchFoundPets();
      fetchMissingPets();
    } catch (error) {
      console.error("Error reporting pet:", error);
    }
  };

  const selectPhotoFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      setSelectedImage(image.webPath);
    } catch (error) {
      console.error("Error selecting photo:", error);
    }
  };

  return (
    <div className="map-container" ref={mapContainerRef} style={{ height: "100%", width: "100%" }}>
      {showPlacementMessage && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-delft-blue bg-opacity-80 text-eggshell px-4 py-2 rounded-full shadow-lg z-10">
          <p className="text-sm font-semibold text-center">
            Tap on the map to place a found pet
          </p>
        </div>
      )}
      {showPhotoCapture && (
        <PhotoCapture
          onCapture={(imageUri) => {
            setSelectedImage(imageUri);
            setShowPhotoCapture(false);
          }}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}
      <div className="absolute top-16 right-4 z-10 notification-icon">
        <button className="bg-delft-blue text-eggshell p-2 rounded-full shadow-lg hover:bg-burnt-sienna transition-colors">
          <FaBell className="text-xl" />
        </button>
      </div>
    </div>
  );
});

export default Map;