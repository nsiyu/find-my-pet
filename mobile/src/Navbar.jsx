import React from "react";
import { FaMap, FaHome, FaUser } from "react-icons/fa";

const Navbar = ({ activeView, onViewChange }) => {
  const navItems = [
    { name: "Map", icon: FaMap },
    { name: "Home", icon: FaHome },
    { name: "Profile", icon: FaUser },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-delft-blue bg-opacity-90 rounded-full shadow-lg flex justify-around items-center py-2 px-4 w-11/12 max-w-sm z-10">
      {navItems.map((item) => (
        <button
          key={item.name}
          className={`flex flex-col items-center p-2 rounded-full transition-all duration-300 ${
            activeView === item.name
              ? "bg-burnt-sienna text-eggshell"
              : "text-eggshell hover:bg-cambridge-blue hover:bg-opacity-50"
          }`}
          onClick={() => onViewChange(item.name)}
        >
          <item.icon className="text-2xl mb-1" />
          <span className="text-xs font-medium">{item.name}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;