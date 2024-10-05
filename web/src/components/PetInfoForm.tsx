import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl, { Map, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Select from 'react-select';
import { FaArrowLeft } from 'react-icons/fa';

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;

interface PetInfo {
  name: string;
  age: string;
  breeds: string[];
  color: string;
  gender: string;
  description: string;
  image: File | null;
  lastKnownLocation: { latitude: number; longitude: number };
}

const breedOptions = [
  { value: 'labrador', label: 'Labrador' },
  { value: 'germanShepherd', label: 'German Shepherd' },
  { value: 'goldenRetriever', label: 'Golden Retriever' },
  { value: 'beagle', label: 'Beagle' },
  { value: 'poodle', label: 'Poodle' },
  { value: 'bulldog', label: 'Bulldog' },
  { value: 'rottweiler', label: 'Rottweiler' },
  { value: 'boxer', label: 'Boxer' },
  { value: 'dachshund', label: 'Dachshund' },
  { value: 'siberianHusky', label: 'Siberian Husky' },
];

const PetInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: '',
    age: '',
    breeds: [],
    color: '',
    gender: '',
    description: '',
    image: null,
    lastKnownLocation: { latitude: 0, longitude: 0 },
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_ACCESS_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    const initializeMap = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9
    });

    initializeMap.on('load', () => {
      setMap(initializeMap);
    });

    initializeMap.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setPetInfo(prev => ({
        ...prev,
        lastKnownLocation: { latitude: lat, longitude: lng }
      }));

      if (markerRef.current) {
        markerRef.current.remove();
      }

      const newMarker = new Marker()
        .setLngLat([lng, lat])
        .addTo(initializeMap);

      markerRef.current = newMarker;
    });

    return () => {
      initializeMap.remove();
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPetInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleBreedChange = (selectedOptions: any) => {
    setPetInfo(prev => ({ ...prev, breeds: selectedOptions.map((option: any) => option.value) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPetInfo(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('name', petInfo.name);
    formData.append('age', petInfo.age);
    formData.append('breeds', JSON.stringify(petInfo.breeds));
    formData.append('color', petInfo.color);
    formData.append('gender', petInfo.gender);
    formData.append('description', petInfo.description);
    formData.append('lastKnownLocation', JSON.stringify(petInfo.lastKnownLocation));
    if (petInfo.image) {
      formData.append('image', petInfo.image);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5001/register-missing-pet', {
        method: 'POST',
        headers: {
          'Authorization': token
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register pet');
      }

      const data = await response.json();
      console.log('Pet registered successfully:', data);
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-alice-blue py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 text-caribbean-current hover:text-atomic-tangerine transition-colors"
          >
            <FaArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-bold text-caribbean-current">Register a Missing Pet</h2>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-caribbean-current mb-1">
                Pet Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={petInfo.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
                required
              />
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-caribbean-current mb-1">
                Age
              </label>
              <input
                type="text"
                id="age"
                name="age"
                value={petInfo.age}
                onChange={handleInputChange}
                className="w-full p-2 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
                required
              />
            </div>
            <div>
              <label htmlFor="breeds" className="block text-sm font-medium text-caribbean-current mb-1">
                Breeds
              </label>
              <Select
                isMulti
                name="breeds"
                options={breedOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleBreedChange}
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-caribbean-current mb-1">
                Color
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={petInfo.color}
                onChange={handleInputChange}
                className="w-full p-2 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-caribbean-current mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={petInfo.gender}
              onChange={handleInputChange}
              className="w-full p-2 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-caribbean-current mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={petInfo.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
              placeholder="Describe your pet..."
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-caribbean-current mb-1">
              Upload Pet Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full p-2 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-caribbean-current mb-1">
              Last Known Location
            </label>
            <div ref={mapContainerRef} className="w-full h-64 rounded-lg mb-2"></div>
            <p className="text-sm text-gray-500">
              Click on the map to set the last known location of your pet.
            </p>
            {petInfo.lastKnownLocation.latitude !== 0 && (
              <p className="text-sm text-caribbean-current mt-2">
                Selected Location: {petInfo.lastKnownLocation.latitude.toFixed(6)}, {petInfo.lastKnownLocation.longitude.toFixed(6)}
              </p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-atomic-tangerine text-white rounded-md hover:bg-caribbean-current transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PetInfoForm;