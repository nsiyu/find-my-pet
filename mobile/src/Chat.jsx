import React, { useState } from "react";
import { Camera, CameraResultType } from "@capacitor/camera";
import { FaCamera, FaArrowLeft } from "react-icons/fa";

const Chat = () => {
  const [imageUrl, setImageUrl] = useState(null);

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
      });
      setImageUrl(image.webPath);
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <button
        className="absolute top-4 left-4 text-white text-2xl"
        onClick={() => {
          /* Add navigation logic here */
        }}
      >
        <FaArrowLeft />
      </button>
      <div className="flex-1 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-white text-xl">No image captured</div>
        )}
      </div>
      <button
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-4xl p-4 rounded-full"
        onClick={takePicture}
      >
        <FaCamera />
      </button>
    </div>
  );
};

export default Chat;
