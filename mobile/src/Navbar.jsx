import React, { useState, useEffect, useRef } from "react";
import { FaUser, FaCog, FaHome, FaMap, FaPaw } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ activeView, onViewChange, onReportStart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { opacity: 1, scale: 1 },
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define the buttons with their respective icons, actions, colors, and angles
  const buttons = [
    {
      icon: <FaHome className="text-xl" />,
      label: "Home",
      onClick: () => {
        onViewChange("Home");
        setIsExpanded(false);
      },
      bgColor: "bg-burnt-sienna",
      textColor: "text-eggshell",
      angle: 150, // Upper-left
    },
    {
      icon: <FaCog className="text-xl" />,
      label: "Settings",
      onClick: () => {
        onViewChange("Settings");
        setIsExpanded(false);
      },
      bgColor: "bg-sunset",
      textColor: "text-delft-blue",
      angle: 120, // Left
    },
    {
      icon: <FaMap className="text-xl" />,
      label: "Map",
      onClick: () => {
        onViewChange("Map");
        setIsExpanded(false);
      },
      bgColor: "bg-eggshell",
      textColor: "text-delft-blue",
      angle: 60, // Right
    },
    {
      icon: <FaPaw className="text-xl" />,
      label: "Report",
      onClick: () => {
        onReportStart();
        setIsExpanded(false);
      },
      bgColor: "bg-cambridge-blue",
      textColor: "text-eggshell",
      angle: 30, // Upper-right
    },
  ];

  // Radius for button placement
  const radius = 80; // Reduced value to bring buttons closer

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-delft-blue bg-opacity-90 rounded-full shadow-lg flex justify-between items-center py-2 px-4 w-11/12 max-w-sm z-20">
        <button
          onClick={() => onViewChange("Profile")}
          className={`text-eggshell p-2 rounded-full ${
            activeView === "Profile" ? "bg-burnt-sienna" : ""
          }`}
          aria-label="Profile"
        >
          <FaUser className="text-2xl" />
        </button>

        <div className="relative" ref={menuRef}>
          <motion.button
            onClick={toggleExpand}
            className="bg-cambridge-blue text-eggshell p-1 rounded-full shadow-lg overflow-hidden focus:outline-none"
            whileTap={{ scale: 0.95 }}
            aria-label="Menu"
          >
            <img
              src="https://png.pngtree.com/png-clipart/20230406/original/pngtree-puppy-sticker-cartoon-dog-cute-png-image_9029375.png"
              alt="Dog"
              className="w-12 h-12 object-cover"
            />
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="absolute bottom-full left-2 transform -translate-x-1/2 -translate-y-4 w-4 h-8"
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {buttons.map((button, index) => {
                  const angleInRadians = (button.angle * Math.PI) / 180;
                  const x = radius * Math.cos(angleInRadians);
                  const y = radius * Math.sin(angleInRadians);

                  return (
                    <motion.button
                      key={button.label}
                      variants={iconVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: 0.05 * index }}
                      onClick={button.onClick}
                      className={`${button.bgColor} ${button.textColor} p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 absolute`}
                      style={{
                        left: `${x}px`,
                        top: `${-y}px`,
                      }}
                      aria-label={button.label}
                    >
                      {button.icon}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-eggshell text-sm font-bold bg-burnt-sienna px-3 py-1 rounded-full">
          Lvl 5
        </div>
      </nav>
    </>
  );
};

export default Navbar;