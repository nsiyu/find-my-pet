import React, { useState, useEffect } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { FaCamera, FaArrowLeft, FaImage } from "react-icons/fa";

const PhotoCapture = ({ onCapture, onClose }) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const permission = await Camera.requestPermissions({
        permissions: ["camera"],
      });
      setHasCameraPermission(permission.camera === "granted");
    } catch (error) {
      console.error("Error requesting camera permission:", error);
    }
  };

  const captureImage = async (source) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: source,
      });
      onCapture(image.webPath);
    } catch (error) {
      console.error("Error capturing/selecting photo:", error);
    }
  };

  const takePicture = () => captureImage(CameraSource.Camera);
  const selectPicture = () => captureImage(CameraSource.Photos);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <button
        className="absolute top-4 left-4 text-white text-2xl"
        onClick={onClose}
      >
        <FaArrowLeft />
      </button>
      <div className="flex-1 flex items-center justify-center space-x-8">
        <button
          className="bg-white text-black text-6xl p-6 rounded-full"
          onClick={takePicture}
        >
          <FaCamera />
        </button>
        <button
          className="bg-white text-black text-6xl p-6 rounded-full"
          onClick={selectPicture}
        >
          <FaImage />
        </button>
      </div>
    </div>
  );
};

export default PhotoCapture;
