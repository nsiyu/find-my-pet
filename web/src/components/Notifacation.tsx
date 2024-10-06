import React, { useState, useEffect, useRef } from "react";
import { FaBell, FaPaw } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  message: string;
  petId: string;
  petImage: string;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      // In a real application, replace this with your actual data fetching logic
      const mockNotifications: Notification[] = [
        {
          id: "1",
          message: "A found pet matches your missing pet!",
          petId: "somePetId1",
          petImage: "https://example.com/pet1.jpg",
        },
        {
          id: "2",
          message: "Another found pet might be yours!",
          petId: "somePetId2",
          petImage: "https://example.com/pet2.jpg",
        },
        // Add more mock notifications as needed
      ];
      setNotifications(mockNotifications);
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = (petId: string) => {
    navigate(`/database`, { state: { highlightPetId: petId } });
    setShowNotifications(false);
    // Optionally, mark the notification as read or remove it
    setNotifications((prev) => prev.filter((notif) => notif.petId !== petId));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setShowNotifications(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 bg-tiffany-blue text-caribbean-current rounded-full hover:bg-pale-dogwood transition duration-300 relative"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="Notifications"
      >
        <FaBell size={20} />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-atomic-tangerine text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {notifications.length}
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-alice-blue rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="bg-caribbean-current text-white py-2 px-4 font-semibold">
            Notifications
          </div>
          <div className="max-h-48 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-tiffany-blue hover:bg-opacity-30 cursor-pointer border-b border-tiffany-blue flex items-center space-x-3 transition duration-300 ease-in-out"
                  onClick={() => handleNotificationClick(notification.petId)}
                >
                  <div className="flex-shrink-0">
                    {notification.petImage ? (
                      <img
                        src={notification.petImage}
                        alt="Pet"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-tiffany-blue flex items-center justify-center">
                        <FaPaw className="text-white" size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-medium text-caribbean-current truncate">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-caribbean-current">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
