import React, { useState } from "react";
import { FaCamera, FaImage, FaTimes } from "react-icons/fa";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import PhotoCapture from "./PhotoCapture";

const ReportPopup = ({ onSubmit, onCancel, nearbyShelters, location }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState("");
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("location", JSON.stringify(location)); // Ensure location is included
    formData.append("date", new Date().toISOString()); // Example: current date

    if (selectedImage) {
      fetch(selectedImage)
        .then(res => res.blob())
        .then(blob => {
          formData.append("picture", blob, "pet-photo.jpg");
          onSubmit(formData);
        })
        .catch(error => {
          console.error("Error processing image:", error);
        });
    } else {
      onSubmit(formData);
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
    <div className="fixed inset-0 bg-delft-blue bg-opacity-50 flex items-center justify-center z-20">
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
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-delft-blue">
              Date Found
            </label>
            <input
              type="date"
              name="date"
              id="date"
              className="w-full p-2 border border-cambridge-blue rounded-md focus:outline-none focus:ring-2 focus:ring-delft-blue"
              required
              defaultValue={new Date().toISOString().split('T')[0]} // Sets today's date as default
            />
          </div>
          <select
            name="shelter"
            value={selectedShelter}
            onChange={(e) => setSelectedShelter(e.target.value)}
            className="w-full p-2 border border-cambridge-blue rounded-md focus:outline-none focus:ring-2 focus:ring-delft-blue"
            required
          >
            <option value="">Select a shelter</option>
            {nearbyShelters.length > 0 ? (
              nearbyShelters.map((shelter) => (
                <option key={shelter.place_id} value={shelter.name}>
                  {shelter.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No shelters available
              </option>
            )}
          </select>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
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
    </div>
  );
};

export default ReportPopup;