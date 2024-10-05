import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, NavigationControl, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaFilter, FaSearch } from 'react-icons/fa';
import React from 'react'

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

interface Pet {
  id: number;
  name: string;
  breed: string;
  shelter: string;
  address: string;
  contact: string;
  foundLocation: string;
  coordinates: [number, number];
  image: string;
}

const mockPets: Pet[] = [
  {
    id: 1,
    name: "Buddy",
    breed: "Labrador",
    shelter: "Happy Paws Shelter",
    address: "123 Main St, Anytown, USA",
    contact: "(555) 123-4567",
    foundLocation: "Central Park",
    coordinates: [-74.0060, 40.7128],
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    name: "Whiskers",
    breed: "Siamese Cat",
    shelter: "Feline Friends Rescue",
    address: "456 Oak Ave, Somewhere, USA",
    contact: "(555) 987-6543",
    foundLocation: "Downtown Area",
    coordinates: [-73.9857, 40.7484],
    image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
  },
  // Add more mock pets as needed
];

function PetDatabase() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPets, setFilteredPets] = useState(mockPets);

  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const initializeMap = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.0060, 40.7128],
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

    // Clear existing markers
    document.querySelectorAll('.marker').forEach(marker => marker.remove());

    // Add markers for filtered pets
    filteredPets.forEach(pet => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${pet.image})`;
      el.style.width = '50px';
      el.style.height = '50px';
      el.style.backgroundSize = 'cover';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid #e29578';

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
    setFilteredPets(mockPets.filter(pet => 
      pet.name.toLowerCase().includes(term) || 
      pet.breed.toLowerCase().includes(term) ||
      pet.shelter.toLowerCase().includes(term)
    ));
  };

  const handlePetClick = (pet: Pet) => {
    if (map) {
      map.flyTo({ center: pet.coordinates, zoom: 14 });
    }
  };

  return (
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
          {filteredPets.map(pet => (
            <div 
              key={pet.id} 
              className="bg-alice-blue p-4 rounded-lg shadow-md cursor-pointer hover:bg-pale-dogwood transition duration-300"
              onClick={() => handlePetClick(pet)}
            >
              <div className="flex items-center space-x-4">
                <img src={pet.image} alt={pet.name} className="w-20 h-20 object-cover rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold text-caribbean-current">{pet.name}</h3>
                  <p className="text-sm text-gray-600">{pet.breed}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm"><strong>Shelter:</strong> {pet.shelter}</p>
                <p className="text-sm"><strong>Address:</strong> {pet.address}</p>
                <p className="text-sm"><strong>Contact:</strong> {pet.contact}</p>
                <p className="text-sm"><strong>Found at:</strong> {pet.foundLocation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PetDatabase;