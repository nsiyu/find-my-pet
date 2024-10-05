import React, { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { FaTimes, FaCamera } from "react-icons/fa";

const ReportPopup = ({ petType, onSubmit, onCancel }) => {
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const reportData = {
      date: formData.get("date"),
      contact: formData.get("contact"),
      images: images,
    };

    if (petType === "lost") {
      reportData.name = formData.get("name");
      reportData.breed = formData.get("breed");
      reportData.owner = formData.get("owner");
    }

    onSubmit(reportData);
  };

  const requestPermissions = async () => {
    try {
      const permission = await Camera.requestPermissions({
        permissions: ["photos"],
      });
      return permission.photos === "granted";
    } catch (error) {
      console.error("Error requesting camera permissions:", error);
      return false;
    }
  };

  const handleImageSelection = async () => {
    try {
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.photos !== 'granted') {
        const permission = await Camera.requestPermissions({ permissions: ['photos'] });
        if (permission.photos !== 'granted') {
          alert("Permission to access photos is required.");
          return;
        }
      }

      const result = await Camera.pickImages({
        quality: 90,
        limit: 5 - images.length,
        presentationStyle: 'fullScreen'
      });

      if (result.photos) {
        const newImages = result.photos.map(photo => photo.webPath);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error("Error selecting images:", error);
      alert("An error occurred while selecting images. Please try again.");
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-5/6 max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {petType === "lost" ? "Report Lost Pet" : "Report Found Pet"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input
            type="date"
            name="date"
            required
            className="w-full p-2 border rounded text-sm"
            placeholder="Date"
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Information"
            required
            className="w-full p-2 border rounded text-sm"
          />
          {petType === "lost" && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Pet Name"
                required
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                name="breed"
                placeholder="Pet Breed"
                required
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                name="owner"
                placeholder="Owner Name"
                required
                className="w-full p-2 border rounded text-sm"
              />
            </>
          )}
          <button
            type="button"
            onClick={handleImageSelection}
            className="w-full p-2 bg-blue-500 text-white rounded flex items-center justify-center"
            disabled={images.length >= 5}
          >
            <FaCamera className="mr-2" />
            Add Image ({images.length}/5)
          </button>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt={`Uploaded ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm"
              disabled={images.length === 0}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportPopup;
