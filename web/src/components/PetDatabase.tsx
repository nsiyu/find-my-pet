import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, NavigationControl, Marker, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaFilter, FaSearch } from 'react-icons/fa';
import React from 'react';
import Select from 'react-select';
import PetPopup from './PetPopup';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

interface Pet {
  id: string;
  name: string;
  breed: string;
  foundLocation: string;
  coordinates: [number, number];
  image: string;
  status: 'missing' | 'found';
}

function PetDatabase() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const markersRef = useRef<{ [key: string]: Marker }>({});
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    breed: '',
    status: '',
    location: '',
  });
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (mapContainerRef.current && !map) {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
      const initializedMap = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 3,
        attributionControl: false  
      });

      initializedMap.addControl(new mapboxgl.AttributionControl({
        customAttribution: 'Powered by FindMyPet',
        compact: true
      }), 'bottom-right');

      initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      initializedMap.on('load', () => {
        setMap(initializedMap);
      });
    }
  }, [map]);

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
    if (map && allPets.length > 0) {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};

      allPets.forEach(pet => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = `url(${pet.image})`;
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundSize = '100%';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid #fff';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(pet.coordinates)
          .addTo(map);

        marker.getElement().addEventListener('click', () => {
          setSelectedPet(pet);
        });

        markersRef.current[pet.id] = marker;
      });

      const bounds = new mapboxgl.LngLatBounds();
      allPets.forEach(pet => bounds.extend(pet.coordinates));
      map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 1000 });
    }
  }, [map, allPets]);

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
      map.flyTo({
        center: pet.coordinates,
        zoom: 14,
        speed: 5,
        curve: 1.5,
        essential: true
      });
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const applyFilters = () => {
    let filtered = allPets;

    if (filters.breed) {
      filtered = filtered.filter(pet => pet.breed.toLowerCase() === filters.breed.toLowerCase());
    }
    if (filters.status) {
      filtered = filtered.filter(pet => pet.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.location) {
      filtered = filtered.filter(pet => pet.foundLocation.toLowerCase().includes(filters.location.toLowerCase()));
    }

    setFilteredPets(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, allPets]);

  return (
    <div className="h-screen flex flex-col">
      <div className="relative w-full h-screen">
        <div ref={mapContainerRef} className="w-full h-full" />
        {/* Add custom CSS for attribution */}
        <style jsx>{`
          .mapboxgl-ctrl-attrib {
            font-size: 10px;
            line-height: 1.2;
            opacity: 0.7;
            transition: opacity 0.2s;
          }
          .mapboxgl-ctrl-attrib:hover {
            opacity: 1;
          }
          .mapboxgl-ctrl-attrib a {
            color: #404040;
          }
        `}</style>
        <div className="absolute top-4 left-4 bottom-4 w-80 bg-white bg-opacity-90 shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate('/')}
                className="p-2 bg-caribbean-current text-white rounded-full hover:bg-atomic-tangerine transition duration-300"
              >
                <FaHome size={20} />
              </button>
              <button
                onClick={() => {/* Toggle filter visibility */}}
                className="p-2 bg-tiffany-blue text-caribbean-current rounded-full hover:bg-pale-dogwood transition duration-300"
              >
                <FaFilter size={20} />
              </button>
            </div>
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
            <div className="space-y-2">
              <Select
                placeholder="Filter by breed"
                options={[...new Set(allPets.map(pet => pet.breed))].map(breed => ({ value: breed, label: breed }))}
                onChange={(option) => handleFilterChange('breed', option ? option.value : '')}
                isClearable
              />
              <Select
                placeholder="Filter by status"
                options={[
                  { value: 'missing', label: 'Missing' },
                  { value: 'found', label: 'Found' },
                ]}
                onChange={(option) => handleFilterChange('status', option ? option.value : '')}
                isClearable
              />
              <Select
                placeholder="Filter by location"
                options={[...new Set(allPets.map(pet => pet.foundLocation))].map(location => ({ value: location, label: location }))}
                onChange={(option) => handleFilterChange('location', option ? option.value : '')}
                isClearable
              />
            </div>
          </div>
          <div className="h-[calc(100%-200px)] overflow-y-auto p-4">
            {filteredPets.length > 0 ? (
              filteredPets.map(pet => (
                <div
                  key={pet.id}
                  className="bg-alice-blue p-4 rounded-lg shadow-md cursor-pointer hover:bg-pale-dogwood transition duration-300 mb-4"
                  onClick={() => handlePetClick(pet)}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="w-16 h-16 object-cover rounded-full border-2 border-caribbean-current"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-caribbean-current">{pet.name}</h3>
                      <p className="text-sm text-gray-600">{pet.breed}</p>
                      <p className="text-xs text-gray-500">{pet.foundLocation}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No pets found.</p>
            )}
          </div>
        </div>
        {selectedPet && (
          <PetPopup
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
          />
        )}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default PetDatabase;