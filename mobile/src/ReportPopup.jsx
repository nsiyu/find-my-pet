import React, { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { FaTimes, FaCamera } from "react-icons/fa";

// Add this style block at the top of your file
const preventZoomStyle = `
  input, textarea, select {
    font-size: 16px;
  }
`;

const ReportPopup = ({ onSubmit, onCancel }) => {
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const reportData = {
      date: formData.get("date") || null,
      contact: formData.get("contact") || "",
      images: images,
    };

    onSubmit(reportData);
  };

  const handleImageSelection = async () => {
    try {
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.photos !== "granted") {
        const permission = await Camera.requestPermissions({
          permissions: ["photos"],
        });
        if (permission.photos !== "granted") {
          alert("Permission to access photos is required.");
          return;
        }
      }

      const result = await Camera.pickImages({
        quality: 90,
        limit: 5 - images.length,
        presentationStyle: "fullScreen",
      });

      if (result.photos) {
        const newImages = result.photos.map((photo) => photo.webPath);
        setImages([...images, ...newImages]);
      }
    } catch (error) {
      console.error("Error selecting images:", error);
      alert("An error occurred while selecting images. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Add this style tag */}
      <style>{preventZoomStyle}</style>
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Report Found Pet
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4 overflow-y-auto flex-grow"
        >
          <input
            type="date"
            name="date"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Date"
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Information"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
          <button
            type="button"
            onClick={handleImageSelection}
            className="w-full p-2 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors"
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
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== index))
                    }
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
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
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
