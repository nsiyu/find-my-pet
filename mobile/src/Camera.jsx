import React, { useState, useEffect } from "react";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import PhotoCapture from "./PhotoCapture";
import axios from "axios";

const CameraComponent = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [expandedPet, setExpandedPet] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [missingPets, setMissingPets] = useState([]);

  useEffect(() => {
    fetchMissingPets();
  }, []);

  const fetchMissingPets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/user-missing-pets",
        {
          headers: { Authorization: token },
        }
      );
      setMissingPets(response.data.pets);
    } catch (error) {
      console.error("Error fetching missing pets:", error);
    }
  };

  const handlePhotoCapture = (imageUri) => {
    console.log("Captured image URI:", imageUri);
    setShowCamera(false);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatLocation = (location) => {
    if (
      location &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
    ) {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(
        4
      )}`;
    }
    return "Location not available";
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {!showCamera && !expandedImage ? (
        <>
          <div className="p-4 pt-16 pb-32 overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Missing Pets
            </h1>
            <div className="space-y-4">
              {missingPets.map((pet) => (
                <div
                  key={pet._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() =>
                      setExpandedPet(expandedPet === pet._id ? null : pet._id)
                    }
                  >
                    <div className="flex items-center">
                      <img
                        src={`https://gateway.pinata.cloud/ipfs/${pet.image}`}
                        alt={pet.name}
                        className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-blue-500"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {pet.name}
                        </h2>
                        <p className="text-gray-600">{pet.breed}</p>
                      </div>
                    </div>
                    {expandedPet === pet._id ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                  <div
                    className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedPet === pet._id ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="p-4 space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">Age:</span> {pet.age}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Color:</span>{" "}
                        {pet.color}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Gender:</span>{" "}
                        {pet.gender}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Description:</span>{" "}
                        {pet.description}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Missing since:</span>{" "}
                        {formatDate(pet.createdAt)}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <span className="font-semibold mr-1">
                          Last Known Location:
                        </span>
                        <FaMapMarkerAlt className="text-red-500 mr-1" />
                        {formatLocation(pet.lastKnownLocation)}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Status:</span>{" "}
                        {pet.status}
                      </p>
                      <div className="mt-2 flex flex-wrap">
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${pet.image}`}
                          alt={pet.name}
                          className="w-16 h-16 object-cover rounded-md m-1 cursor-pointer hover:opacity-75 transition-opacity duration-200"
                          onClick={() =>
                            setExpandedImage(
                              `https://gateway.pinata.cloud/ipfs/${pet.image}`
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="fixed bottom-24 left-0 right-0 p-4">
            <button
              className="w-full bg-blue-500 text-white py-4 px-6 rounded-full flex items-center justify-center text-lg font-semibold shadow-lg hover:bg-blue-600 transition-colors duration-200"
              onClick={() => setShowCamera(true)}
            >
              <FaCamera className="mr-2" />
              Found a missing pet? Take a photo
            </button>
          </div>
        </>
      ) : showCamera ? (
        <PhotoCapture
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      ) : (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <img
            src={expandedImage}
            alt="Expanded pet"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setExpandedImage(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
