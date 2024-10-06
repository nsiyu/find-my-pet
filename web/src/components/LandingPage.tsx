import React, { useRef, useEffect, useState } from "react";
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaPaw,
  FaComments,
  FaRobot,
} from "react-icons/fa";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";
import NotificationSystem from "./Notifacation";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

interface Pet {
  id: string;
  breed: string;
  coordinates: [number, number];
  image: string;
  status: "missing" | "found";
  nearestCity: string;
  shelter?: string; // ObjectId of the shelter
  shelterInfo?: {
    name: string;
    address: string;
    phone: string;
    website: string;
  };
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onNavigate = (destination: string) => {
    navigate(`/${destination}`);
  };

  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-74.006, 40.7128],
      zoom: 10,
    });

    map.on("load", () => {
      map.setPaintProperty("water", "fill-color", "#83c5be");
      map.setPaintProperty("land", "background-color", "#edf6f9");

      fetchPets().then((fetchedPets) => {
        setPets(fetchedPets);

        fetchedPets.forEach((pet) => {
          const el = document.createElement("div");
          el.className = "marker";
          el.style.backgroundImage = `url(${pet.image})`;
          el.style.width = "30px";
          el.style.height = "30px";
          el.style.backgroundSize = "100%";
          el.style.borderRadius = "50%";
          el.style.border =
            pet.status === "found" ? "2px solid #83c5be" : "2px solid #e76f51";

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div>
              <strong>${pet.breed}</strong><br>
              ${
                pet.status === "found" && pet.shelterInfo
                  ? `<span>Shelter: ${pet.shelterInfo.name}</span><br>
                   <span class="shelter-details" style="display: none;">
                     Address: ${pet.shelterInfo.address}<br>
                     Phone: ${pet.shelterInfo.phone}<br>
                     Website: <a href="${pet.shelterInfo.website}" target="_blank">${pet.shelterInfo.website}</a>
                   </span>`
                  : ""
              }
            </div>`
          );

          const marker = new mapboxgl.Marker(el)
            .setLngLat(pet.coordinates)
            .setPopup(popup)
            .addTo(map);

          // Add hover effect for shelter details
          if (pet.status === "found" && pet.shelterInfo) {
            el.addEventListener("mouseenter", () => {
              el.querySelector(".shelter-details").style.display = "block";
            });
            el.addEventListener("mouseleave", () => {
              el.querySelector(".shelter-details").style.display = "none";
            });
          }
        });

        const bounds = new mapboxgl.LngLatBounds();
        fetchedPets.forEach((pet) => bounds.extend(pet.coordinates));
        map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 1000 });
      });
    });

    return () => map.remove();
  }, []);

  const findNearestCity = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${
          import.meta.env.VITE_OPENCAGE_API_KEY
        }`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const city =
          result.components.city ||
          result.components.town ||
          result.components.village ||
          result.components.county ||
          result.components.state ||
          "Unknown";
        const country = result.components.country;
        return city && country ? `${city}, ${country}` : "Unknown";
      }
    } catch (error) {
      console.error("Error finding nearest city:", error);
    }
    return "Unknown";
  };

  const fetchPets = async (): Promise<Pet[]> => {
    setLoading(true);
    try {
      const [foundResponse, missingResponse] = await Promise.all([
        fetch("http://localhost:5001/found-pets"),
        fetch("http://localhost:5001/user-missing-pets", {
          headers: {
            Authorization: getAuthToken() || "",
          },
        }),
      ]);

      if (!foundResponse.ok) {
        throw new Error(
          `Error fetching found pets: ${foundResponse.statusText}`
        );
      }
      if (!missingResponse.ok) {
        throw new Error(
          `Error fetching missing pets: ${missingResponse.statusText}`
        );
      }

      const foundData = await foundResponse.json();
      const missingData = await missingResponse.json();

      const formatPet = async (pet: any, status: "found" | "missing") => {
        const nearestCity = await findNearestCity(
          pet.location?.latitude || pet.lastKnownLocation?.latitude || 0,
          pet.location?.longitude || pet.lastKnownLocation?.longitude || 0
        );
        return {
          id: pet._id,
          breed: pet.breed || "Unknown",
          coordinates: [
            pet.location?.longitude || pet.lastKnownLocation?.longitude || 0,
            pet.location?.latitude || pet.lastKnownLocation?.latitude || 0,
          ],
          image: pet.pictureUrl || pet.imageUrl || "path/to/fallback/image.jpg",
          status,
          nearestCity,
          shelterInfo: pet.shelterInfo,
        };
      };

      const formattedFoundPets = await Promise.all(
        foundData.pets.map((pet: any) => formatPet(pet, "found"))
      );

      const formattedMissingPets = await Promise.all(
        missingData.pets.map((pet: any) => formatPet(pet, "missing"))
      );

      setLoading(false);
      return [...formattedFoundPets, ...formattedMissingPets];
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-alice-blue to-pale-dogwood p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-bold text-caribbean-current flex items-center">
          <FaPaw className="mr-4" />
          FindMyPet
        </h1>
        <div className="flex items-center space-x-4 ">
          <NotificationSystem />
          <button className="flex items-center space-x-2 bg-caribbean-current text-white px-4 py-2 rounded-lg hover:bg-atomic-tangerine transition duration-300">
            <FaUserCircle />
            <span>Profile</span>
          </button>
        </div>
      </header>

      <div
        ref={mapContainerRef}
        className="w-full h-96 rounded-lg shadow-lg mb-12"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
          <h2 className="text-3xl font-semibold text-caribbean-current mb-4">
            Quick Search
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search pets..."
              className="w-full p-3 pl-10 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-caribbean-current" />
          </div>
          <button
            onClick={() => onNavigate("database")}
            className="mt-4 w-full py-3 px-4 bg-caribbean-current text-white font-semibold rounded-lg shadow-md hover:bg-atomic-tangerine transition duration-300"
          >
            Browse Full Database
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
          <h2 className="text-3xl font-semibold text-caribbean-current mb-4">
            Register a Pet
          </h2>
          <p className="text-gray-600 mb-4">
            Help reunite lost pets with their owners by registering them in our
            database.
          </p>
          <button
            onClick={() => onNavigate("form")}
            className="w-full py-3 px-4 bg-atomic-tangerine text-white font-semibold rounded-lg shadow-md hover:bg-caribbean-current transition duration-300"
          >
            Register New Pet
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
          <h2 className="text-3xl font-semibold text-caribbean-current mb-4">
            Community Forum
          </h2>
          <p className="text-gray-600 mb-4">
            Connect with other pet owners and share experiences.
          </p>
          <button
            onClick={() => onNavigate("community")}
            className="w-full py-3 px-4 bg-tiffany-blue text-white font-semibold rounded-lg shadow-md hover:bg-caribbean-current transition duration-300"
          >
            <FaComments className="inline-block mr-2" />
            Join the Discussion
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
          <h2 className="text-3xl font-semibold text-caribbean-current mb-4">
            AI Assistant
          </h2>
          <p className="text-gray-600 mb-4">
            Get instant help and answers to your pet-related questions from our
            AI assistant.
          </p>
          <button
            onClick={() => onNavigate("ai-assistant")}
            className="w-full py-3 px-4 bg-pale-dogwood text-white font-semibold rounded-lg shadow-md hover:bg-caribbean-current transition duration-300"
          >
            <FaRobot className="inline-block mr-2" />
            Chat with AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
