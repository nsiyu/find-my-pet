import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, NavigationControl } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaFilter, FaSearch } from 'react-icons/fa';
import React from 'react';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

interface Pet {
  id: string;
  name: string;
  breed: string;
  shelter: string;
  address: string;
  contact: string;
  foundLocation: string;
  coordinates: [number, number];
  image: string;
  status: 'missing' | 'found'; 
}

function PetDatabase() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error('Authentication token not found. Please log in.');
        }
        
        const response = await fetch('http://localhost:5001/user-missing-pets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching pets: ${response.statusText}`);
        }

        const data = await response.json();

        const formattedPets: Pet[] = data.pets.map((pet: any) => ({
          id: pet._id,
          name: pet.name,
          breed: pet.breed,
          shelter: 'N/A',
          address: 'N/A',
          contact: 'N/A',
          foundLocation: pet.lastKnownLocation
            ? `${pet.lastKnownLocation.latitude}, ${pet.lastKnownLocation.longitude}`
            : 'Unknown',
          coordinates: [
            pet.lastKnownLocation?.longitude || 0,
            pet.lastKnownLocation?.latitude || 0
          ],
          image: pet.imageUrl || 'path/to/fallback/image.jpg',
          status: pet.status,
        }));

        setAllPets(formattedPets);
        setFilteredPets(formattedPets);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const initializeMap = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-76.4735, 42.4534], // Default center based on example coordinates
      zoom: 10,
    });

    initializeMap.addControl(new NavigationControl());

    initializeMap.on('load', () => {
      initializeMap.setPaintProperty('water', 'fill-color', '#83c5be');
      initializeMap.setPaintProperty('land', 'background-color', '#edf6f9');

      initializeMap.addLayer({
        id: 'country-borders',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1',
        },
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#006d77',
          'line-width': 1,
        },
      });

      setMap(initializeMap);
    });

    return () => initializeMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    const existingMarkers = document.querySelectorAll('.marker');
    existingMarkers.forEach(marker => marker.remove());

    filteredPets.forEach(pet => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${pet.image})`;
      el.style.width = '50px';
      el.style.height = '50px';
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.border = `3px solid ${
        pet.status.toLowerCase() === 'missing' ? 'red' : 'green'
      }`;
      el.style.cursor = 'pointer';

      new mapboxgl.Marker(el)
        .setLngLat(pet.coordinates)
        .addTo(map);

      el.addEventListener('click', () => {
        map.flyTo({ center: pet.coordinates, zoom: 14 });
      });
    });
  }, [map, filteredPets]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredPets(
      allPets.filter(
        pet =>
          pet.name.toLowerCase().includes(term) ||
          pet.breed.toLowerCase().includes(term)
      )
    );
  };

  const handlePetClick = (pet: Pet) => {
    if (map) {
      map.flyTo({ center: pet.coordinates, zoom: 14 });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="relative w-full h-screen">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-0 left-0 h-full w-80 bg-white bg-opacity-90 shadow-lg p-4 overflow-y-auto">
          <div className="mb-4 flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-caribbean-current text-white rounded-full hover:bg-atomic-tangerine transition duration-300"
            >
              <FaHome size={20} />
            </button>
            <button className="p-2 bg-tiffany-blue text-caribbean-current rounded-full hover:bg-pale-dogwood transition duration-300">
              <FaFilter size={20} />
            </button>
          </div>
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search pets..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-2 pl-10 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-caribbean-current" />
            </div>
          </div>
          <div className="space-y-4">
            {filteredPets.length > 0 ? (
              filteredPets.map(pet => (
                <div
                  key={pet.id}
                  className="bg-alice-blue p-4 rounded-lg shadow-md cursor-pointer hover:bg-pale-dogwood transition duration-300"
                  onClick={() => handlePetClick(pet)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-20 h-20 object-cover rounded-full"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-caribbean-current">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-gray-600">{pet.breed}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      <strong>Shelter:</strong> {pet.shelter}
                    </p>
                    <p className="text-sm">
                      <strong>Address:</strong> {pet.address}
                    </p>
                    <p className="text-sm">
                      <strong>Contact:</strong> {pet.contact}
                    </p>
                    <p className="text-sm">
                      <strong>{pet.status.toLowerCase() === 'missing' ? 'Last Seen At:' : 'Found At:'}</strong> {pet.foundLocation}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        pet.status.toLowerCase() === 'missing'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {pet.status.charAt(0).toUpperCase() +
                        pet.status.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No pets found.</p>
            )}
          </div>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default PetDatabase;