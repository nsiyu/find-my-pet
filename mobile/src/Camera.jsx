import React, { useState } from "react";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import PhotoCapture from "./PhotoCapture";

// Updated mock data for missing pets
const missingPets = [
  {
    id: 1,
    name: "Max",
    breed: "Golden Retriever",
    contact: "123-456-7890",
    owner: "John Doe",
    missingDate: "2023-04-15",
    location: { lat: 40.7128, lng: -74.006 },
    images: [
      "https://example.com/max1.jpg",
      "https://example.com/max2.jpg",
      "https://example.com/max3.jpg",
    ],
  },
  {
    id: 2,
    name: "Luna",
    breed: "Siamese Cat",
    contact: "098-765-4321",
    owner: "Jane Smith",
    missingDate: "2023-05-01",
    location: { lat: 34.0522, lng: -118.2437 },
    images: ["https://example.com/luna1.jpg", "https://example.com/luna2.jpg"],
  },
  {
    id: 3,
    name: "Rocky",
    breed: "German Shepherd",
    contact: "111-222-3333",
    owner: "Mike Johnson",
    missingDate: "2023-05-10",
    location: { lat: 37.7749, lng: -122.4194 },
    images: [
      "https://example.com/rocky1.jpg",
      "https://example.com/rocky2.jpg",
      "https://example.com/rocky3.jpg",
      "https://example.com/rocky4.jpg",
    ],
  },
];

const CameraComponent = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [expandedPet, setExpandedPet] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);

  const handlePhotoCapture = (imageUri) => {
    console.log("Captured image URI:", imageUri);
    setShowCamera(false);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
                  key={pet.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() =>
                      setExpandedPet(expandedPet === pet.id ? null : pet.id)
                    }
                  >
                    <div className="flex items-center">
                      <img
                        src={pet.images[0]}
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
                    {expandedPet === pet.id ? (
                      <FaChevronUp className="text-gray-500" />
                    ) : (
                      <FaChevronDown className="text-gray-500" />
                    )}
                  </div>
                  <div
                    className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedPet === pet.id ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <div className="p-4 space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">Owner:</span>{" "}
                        {pet.owner}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Contact:</span>{" "}
                        {pet.contact}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Missing since:</span>{" "}
                        {formatDate(pet.missingDate)}
                      </p>
                      <p className="text-gray-700 flex items-center">
                        <span className="font-semibold mr-1">Location:</span>
                        <FaMapMarkerAlt className="text-red-500 mr-1" />
                        {pet.location.lat.toFixed(4)},{" "}
                        {pet.location.lng.toFixed(4)}
                      </p>
                      <div className="mt-2 flex flex-wrap">
                        {pet.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${pet.name} ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md m-1 cursor-pointer hover:opacity-75 transition-opacity duration-200"
                            onClick={() => setExpandedImage(image)}
                          />
                        ))}
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
