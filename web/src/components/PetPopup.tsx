import React from 'react';
import { FaTimes, FaPaw, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

interface PetPopupProps {
  pet: {
    name: string;
    breed: string;
    status: string;
    foundLocation: string;
    image: string;
    lastSeen?: string;
  };
  onClose: () => void;
}

const PetPopup: React.FC<PetPopupProps> = ({ pet, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-caribbean-current">{pet.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-atomic-tangerine">
            <FaTimes size={24} />
          </button>
        </div>
        <img src={pet.image} alt={pet.name} className="w-full h-48 object-cover rounded-lg mb-4" />
        <div className="space-y-2">
          <p className="flex items-center text-gray-700">
            <FaPaw className="mr-2 text-tiffany-blue" />
            <span className="font-semibold mr-2">Breed:</span> {pet.breed}
          </p>
          <p className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-2 text-atomic-tangerine" />
            <span className="font-semibold mr-2">Last seen:</span> {pet.foundLocation}
          </p>
          {pet.lastSeen && (
            <p className="flex items-center text-gray-700">
              <FaCalendarAlt className="mr-2 text-pale-dogwood" />
              <span className="font-semibold mr-2">Date:</span> {pet.lastSeen}
            </p>
          )}
          <p className={`text-lg font-bold ${pet.status === 'missing' ? 'text-red-500' : 'text-green-500'}`}>
            Status: {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PetPopup;