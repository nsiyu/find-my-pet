import React, { useRef, useEffect } from 'react';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-pale-dogwood p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-caribbean-current mb-4">Quick Search</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search pets..."
              className="w-full p-2 pl-10 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-caribbean-current" />
          </div>
          <button
            onClick={() => onNavigate('database')}
            className="mt-4 w-full py-2 px-4 bg-caribbean-current text-white font-semibold rounded-lg shadow-md hover:bg-atomic-tangerine transition duration-300 ease-in-out transform hover:scale-105"
          >
            Browse Full Database
          </button>
        </div>

        <div className="bg-tiffany-blue p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-white mb-4">Register a Pet</h2>
          <p className="text-gray-100 mb-4">Help reunite lost pets with their owners by registering them in our database.</p>
          <button
            onClick={() => onNavigate('form')}
            className="w-full py-2 px-4 bg-white text-caribbean-current font-semibold rounded-lg shadow-md hover:bg-pale-dogwood transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register New Pet
          </button>
        </div>

        <div className="bg-atomic-tangerine p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-white mb-4">AI Assistant</h2>
          <p className="text-gray-100 mb-4">Get intelligent suggestions and assistance for finding or reporting lost pets.</p>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="w-full py-2 px-4 bg-caribbean-current text-white font-semibold rounded-lg shadow-md hover:bg-tiffany-blue transition duration-300 ease-in-out transform hover:scale-105"
          >
            Chat with AI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-caribbean-current p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-white mb-4">Community Forum</h2>
          <p className="text-gray-100 mb-4">Connect with other pet owners, share stories, and get advice.</p>
          <button
            onClick={() => onNavigate('forum')}
            className="w-full py-2 px-4 bg-pale-dogwood text-caribbean-current font-semibold rounded-lg shadow-md hover:bg-tiffany-blue transition duration-300 ease-in-out transform hover:scale-105"
          >
            Join the Conversation
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-caribbean-current mb-4">Resources</h2>
          <p className="text-gray-600 mb-4">Find helpful information about pet care, lost pet procedures, and more.</p>
          <button
            onClick={() => onNavigate('resources')}
            className="w-full py-2 px-4 bg-atomic-tangerine text-white font-semibold rounded-lg shadow-md hover:bg-caribbean-current transition duration-300 ease-in-out transform hover:scale-105"
          >
            Explore Resources
          </button>
        </div>

        <div className="bg-pale-dogwood p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-caribbean-current mb-4">Help Center</h2>
          <p className="text-gray-600 mb-4">Get answers to frequently asked questions and learn how to use our platform.</p>
          <button
            onClick={() => onNavigate('help')}
            className="w-full py-2 px-4 bg-tiffany-blue text-white font-semibold rounded-lg shadow-md hover:bg-caribbean-current transition duration-300 ease-in-out transform hover:scale-105"
          >
            Get Help
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;