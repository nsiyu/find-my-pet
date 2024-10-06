import React, { useState, useEffect } from "react";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import PhotoCapture from "./PhotoCapture";

const CameraComponent = () => {
  const [missingPets, setMissingPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [expandedPet, setExpandedPet] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  useEffect(() => {
    fetch("http://10.0.1.17:5001/missing-pets") // Replace with your actual backend URL
      .then((response) => response.json())
      .then((data) => {
        setMissingPets(data.pets);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching missing pets:", error);
        setError(error);
        setLoading(false);
      });
  }, []);

  const handlePhotoCapture = (imageUri) => {
    console.log("Captured image URI:", imageUri);
    setShowCamera(false);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading missing pets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading missing pets.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-eggshell">
      {!showCamera && !expandedImage ? (
        <>
          <div className="p-4 pt-16 pb-32 overflow-y-auto">
            <h1 className="text-3xl font-bold text-delft-blue mb-6">
              Missing Pets
            </h1>
            <div className="space-y-4">
              {missingPets.map((pet) => (
                <div
                  key={pet._id}
                  className="bg-sunset rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() =>
                      setExpandedPet(expandedPet === pet._id ? null : pet._id)
                    }
                  >
                    <div className="flex items-center">
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-burnt-sienna"
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-delft-blue">
                          {pet.name}
                        </h2>
                        <p className="text-burnt-sienna">{pet.breed}</p>
                      </div>
                    </div>
                    {expandedPet === pet._id ? (
                      <FaChevronUp className="text-burnt-sienna" />
                    ) : (
                      <FaChevronDown className="text-burnt-sienna" />
                    )}
                  </div>
                  <div
                    className={`bg-cambridge-blue bg-opacity-20 overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedPet === pet._id ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="p-4 space-y-2">
                      <p className="text-delft-blue">
                        <span className="font-semibold">Age:</span> {pet.age}
                      </p>
                      <p className="text-delft-blue">
                        <span className="font-semibold">Color:</span> {pet.color}
                      </p>
                      <p className="text-delft-blue">
                        <span className="font-semibold">Gender:</span> {pet.gender}
                      </p>
                      {pet.description && (
                        <p className="text-delft-blue">
                          <span className="font-semibold">Description:</span> {pet.description}
                        </p>
                      )}
                      <p className="text-delft-blue">
                        <span className="font-semibold">Missing since:</span> {formatDate(pet.createdAt)}
                      </p>
                      {pet.lastKnownLocation && (
                        <p className="text-delft-blue flex items-center">
                          <span className="font-semibold mr-1">
                            Last Known Location:
                          </span>
                          <FaMapMarkerAlt className="text-burnt-sienna mr-1" />
                          {pet.lastKnownLocation.latitude.toFixed(4)}, {pet.lastKnownLocation.longitude.toFixed(4)}
                        </p>
                      )}
                      <div className="mt-2">
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-full h-auto object-cover rounded-md cursor-pointer hover:opacity-75 transition-opacity duration-200"
                          onClick={() => setExpandedImage(pet.imageUrl)}
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
              className="w-full bg-burnt-sienna text-eggshell py-4 px-6 rounded-full flex items-center justify-center text-lg font-semibold shadow-lg hover:bg-delft-blue transition-colors duration-200"
              onClick={() => setShowCamera(true)}
            >
              <FaCamera className="mr-2" />
              Found a missing pet? Take a photo
            </button>
          </div>
        </>
      ) : (
        <PhotoCapture
          onCapture={(imageUri) => {
            handlePhotoCapture(imageUri);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default CameraComponent;