import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { v4 as uuidv4 } from "uuid";
import { FaPaw, FaCamera, FaImage, FaTimes } from "react-icons/fa";
import axios from "axios"; 
import PhotoCapture from "./PhotoCapture";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const Map = React.forwardRef((props, ref) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [draggingPin, setDraggingPin] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [foundPets, setFoundPets] = useState([]);
  const [missingPets, setMissingPets] = useState([]);
  const [isPinPlacementMode, setIsPinPlacementMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [nearbyShelters, setNearbyShelters] = useState([]);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [showPlacementMessage, setShowPlacementMessage] = useState(false);

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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    fetchFoundPets();
    fetchMissingPets();
  }, []);

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
        if (pet.location) {
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
          el.style.backgroundImage = `url(${pet.pictureUrl || 'default-pet-image.jpg'})`;
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
          el.style.width = "40px";
          el.style.height = "40px";
          el.style.backgroundImage = `url(${pet.imageUrl || 'default-pet-image.jpg'})`;
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
          el.style.borderRadius = "50%";
          el.style.border = "3px solid #e07a5f";
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

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: true,
          }).setDOMContent(popupContent);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { lng, lat } = newMarker;

    formData.append("shelter", selectedShelter || "Unknown Shelter");
    formData.append(
      "location",
      JSON.stringify({ latitude: lat, longitude: lng })
    );
    formData.append("date", formData.get("date") || new Date().toISOString().split("T")[0]);

    if (selectedImage) {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      formData.append("picture", blob, "pet_image.jpg");
    } else {
      console.error("No image selected");
      alert("Please select an image before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        "http://10.0.1.17:5001/register-found-pet",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.status === 201) {
        const markerData = {
          ...newMarker,
          ...Object.fromEntries(formData),
          id: response.data.petId,
          pictureCid: response.data.pictureCid,
        };

        setFoundPets([...foundPets, markerData]);
        setShowPopup(false);
        setNewMarker(null);
        setSelectedImage(null);

        alert("Found pet registered successfully!");

        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 100);
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
          el.style.width = "40px";
          el.style.height = "40px";
          el.style.backgroundImage = `url(${marker.imageUrl || 'default-pet-image.jpg'})`;
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
          el.style.borderRadius = "50%";
          el.style.border = "3px solid #4CAF50";
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

  useEffect(() => {
    if (!map || !isPinPlacementMode) return;

    const placePin = (e) => {
      const { lng, lat } = e.lngLat;
      setNewMarker({ lng, lat });
      setShowPopup(true);
      setIsPinPlacementMode(false);
      setShowPlacementMessage(false);
    };

    map.on('click', placePin);

    return () => {
      map.off('click', placePin);
    };
  }, [map, isPinPlacementMode]);

  const centerMapOnUserLocation = () => {
    if (map && userLocation) {
      map.jumpTo({
        center: userLocation,
        zoom: 14
      });
    }
  };

  React.useImperativeHandle(ref, () => ({
    centerMapOnUserLocation
  }));

  useEffect(() => {
    if (map && nearbyShelters.length > 0) {
      nearbyShelters.forEach((shelter) => {
        const { lat, lng } = shelter.geometry.location;
        
        // Create a DOM element for the marker
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

        // Create popup content
        const popupContent = document.createElement("div");
        popupContent.innerHTML = `
          <h3 style="color: black; font-weight: bold;">${shelter.name}</h3>
          <p style="color: black;">${shelter.vicinity}</p>
        `;

        // Create a popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: true,
        }).setDOMContent(popupContent);

        // Add marker to the map
        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
      });
    }
  }, [map, nearbyShelters]);

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
    <div className="relative h-full w-full bg-[#f0ede5]">
      <div ref={mapContainerRef} className="absolute inset-0" />
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button
          className="bg-burnt-sienna text-eggshell p-3 rounded-full shadow-lg flex items-center"
          onClick={() => {
            setIsPinPlacementMode(true);
            setShowPlacementMessage(true);
          }}
        >
          <FaPaw className="text-xl mr-2" />
          <span>Found</span>
        </button>
        <button
          onClick={() => {
            fetchFoundPets();
            fetchMissingPets();
          }}
          className="bg-delft-blue text-eggshell p-2 rounded-md shadow-lg flex items-center"
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
      {showPlacementMessage && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-delft-blue bg-opacity-80 text-eggshell px-4 py-2 rounded-full shadow-lg z-10">
          <p className="text-sm font-semibold">
            Tap on the map to place a found pet
          </p>
        </div>
      )}
      {showPopup && (
        <div className="absolute inset-0 bg-delft-blue bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-eggshell p-4 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4 text-delft-blue">Report Found Pet</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="petType"
                placeholder="Pet Type (e.g., Dog, Cat)"
                className="w-full p-2 border border-cambridge-blue rounded-md focus:outline-none focus:ring-2 focus:ring-delft-blue"
                required
              />
              <input
                type="text"
                name="breed"
                placeholder="Breed (if known)"
                className="w-full p-2 border border-cambridge-blue rounded-md focus:outline-none focus:ring-2 focus:ring-delft-blue"
              />
              <textarea
                name="description"
                placeholder="Description"
                className="w-full p-2 border border-cambridge-blue rounded-md focus:outline-none focus:ring-2 focus:ring-delft-blue"
                required
              ></textarea>
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPhotoCapture(true)}
                    className="flex-1 p-3 bg-burnt-sienna text-eggshell rounded-md hover:bg-delft-blue transition-colors flex items-center justify-center"
                  >
                    <FaCamera className="mr-2" />
                    Take Photo
                  </button>
                  <button
                    type="button"
                    onClick={selectPhotoFromGallery}
                    className="flex-1 p-3 bg-cambridge-blue text-eggshell rounded-md hover:bg-delft-blue transition-colors flex items-center justify-center"
                  >
                    <FaImage className="mr-2" />
                    Select Photo
                  </button>
                </div>
                {selectedImage && (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected pet"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-burnt-sienna text-eggshell p-2 rounded-full hover:bg-delft-blue transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
              </div>
              <select
                name="shelter"
                value={selectedShelter}
                onChange={(e) => setSelectedShelter(e.target.value)}
                className="w-full p-2 border border-cambridge-blue rounded-md focus:outline-none focus:ring-2 focus:ring-delft-blue"
                required
              >
                <option value="">Select a shelter</option>
                {nearbyShelters.map((shelter) => (
                  <option key={shelter.place_id} value={shelter.name}>
                    {shelter.name}
                  </option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-sunset text-delft-blue rounded-md hover:bg-cambridge-blue hover:text-eggshell transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-delft-blue text-eggshell rounded-md hover:bg-burnt-sienna transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
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
    </div>
  );
});

export default Map;