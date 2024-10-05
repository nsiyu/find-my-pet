import React, { useState } from "react";
import { FaMap, FaCamera, FaComments } from "react-icons/fa";

const Navbar = ({ onMapClick, onCameraClick, onChatClick }) => {
  const [activeNav, setActiveNav] = useState("Map");

  const navItems = [
    { name: "Map", icon: FaMap, onClick: onMapClick },
    { name: "Camera", icon: FaCamera, onClick: onCameraClick },
    { name: "Chat", icon: FaComments, onClick: onChatClick },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-30 rounded-full shadow-lg flex justify-around items-center py-2 px-4 w-11/12 max-w-sm z-10">
      {navItems.map((item) => (
        <button
          key={item.name}
          className={`flex flex-col items-center p-2 rounded-full transition-all duration-300 ${
            activeNav === item.name
              ? "bg-blue-500 text-white"
              : "bg-white bg-opacity-20 text-gray-200 hover:bg-opacity-30"
          }`}
          onClick={() => {
            setActiveNav(item.name);
            item.onClick();
          }}
        >
          <item.icon className="text-xl mb-1" />
          <span className="text-xs font-medium">{item.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
