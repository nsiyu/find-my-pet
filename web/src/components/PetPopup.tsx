import React from "react";
import {
  FaTimes,
  FaPaw,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHome,
} from "react-icons/fa";

interface PetPopupProps {
  pet: {
    breed: string;
    status: "missing" | "found";
    nearestCity: string;
    image: string;
    lastSeen?: string;
    shelterInfo?: {
      name: string;
      address: string;
      phone: string;
      website: string;
    };
  };
  onClose: () => void;
}

const PetPopup: React.FC<PetPopupProps> = ({ pet, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-caribbean-current">
            {pet.status === "missing" ? "Missing Pet" : "Found Pet"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-atomic-tangerine"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <img
          src={pet.image}
          alt={pet.breed}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <div className="space-y-2">
          <p className="flex items-center text-gray-700">
            <FaPaw className="mr-2 text-tiffany-blue" />
            <span className="font-semibold mr-2">Breed:</span> {pet.breed}
          </p>
          <p className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-2 text-atomic-tangerine" />
            <span className="font-semibold mr-2">
              {pet.status === "missing" ? "Last seen:" : "Found in:"}
            </span>{" "}
            {pet.nearestCity}
          </p>
          {pet.status === "missing" && pet.lastSeen && (
            <p className="flex items-center text-gray-700">
              <FaCalendarAlt className="mr-2 text-pale-dogwood" />
              <span className="font-semibold mr-2">Date last seen:</span>{" "}
              {pet.lastSeen}
            </p>
          )}
          {pet.status === "found" && pet.shelterInfo && (
            <div className="mt-4">
              <div className="flex items-center text-caribbean-current mb-2 ">
                <FaHome className="mr-2 text-pale-dogwood" />
                <h3 className="text-lg font-semibold">Shelter Information</h3>
              </div>
              <div className="ml-4 space-y-1  ">
                <p className="text-gray-700">
                  <span className="font-semibold ">Name:</span>{" "}
                  {pet.shelterInfo.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Address:</span>{" "}
                  {pet.shelterInfo.address}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Phone:</span>{" "}
                  {pet.shelterInfo.phone}
                </p>
                <a
                  href={pet.shelterInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline block"
                >
                  Visit Website
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetPopup;
