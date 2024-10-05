import React from "react";
import { FaComments } from "react-icons/fa";

const Chat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <FaComments className="text-6xl text-gray-400 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-700">Chat View</h1>
      <p className="text-gray-500 mt-2">Chat functionality coming soon!</p>
    </div>
  );
};

export default Chat;
