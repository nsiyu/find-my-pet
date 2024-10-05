import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react'
import { FaSearch, FaPaw, FaBell, FaUserCircle } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const onNavigate = (destination: string) => {
    navigate(`/${destination}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.0060, 40.7128],
      zoom: 10,
    });

    map.on('load', () => {
      map.setPaintProperty('water', 'fill-color', '#83c5be');
      map.setPaintProperty('land', 'background-color', '#edf6f9');
    });

    return () => map.remove();
  }, []);

  return (
    <div className="min-h-screen bg-alice-blue p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-caribbean-current">FindMyPet Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-tiffany-blue text-caribbean-current rounded-full hover:bg-pale-dogwood transition duration-300">
            <FaBell size={20} />
          </button>
          <button className="flex items-center space-x-2 bg-caribbean-current text-white px-4 py-2 rounded-lg hover:bg-atomic-tangerine transition duration-300">
            <FaUserCircle />
            <span>Profile</span>
          </button>
        </div>
      </header>

      <div ref={mapContainerRef} className="w-full h-64 rounded-lg shadow-md mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-caribbean-current mb-4">Quick Search</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a pet..."
              className="w-full p-2 pl-10 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-caribbean-current" />
          </div>
          <button
            onClick={() => onNavigate('database')}
            className="mt-4 w-full py-2 px-4 bg-tiffany-blue text-caribbean-current font-semibold rounded-lg shadow-md hover:bg-pale-dogwood transition duration-300 ease-in-out transform hover:scale-105"
          >
            Browse Full Database
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-caribbean-current mb-4">Register a Pet</h2>
          <p className="text-gray-600 mb-4">Help reunite lost pets with their owners by registering them in our database.</p>
          <button
            onClick={() => onNavigate('form')}
            className="w-full py-2 px-4 bg-atomic-tangerine text-white font-semibold rounded-lg shadow-md hover:bg-caribbean-current transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register New Pet
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-caribbean-current mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <FaPaw className="text-tiffany-blue" />
              <span>New pet registered: Max the Labrador</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaPaw className="text-tiffany-blue" />
              <span>Pet found: Whiskers the Cat</span>
            </li>
            <li className="flex items-center space-x-2">
              <FaPaw className="text-tiffany-blue" />
              <span>Update: Charlie's owner contacted</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
