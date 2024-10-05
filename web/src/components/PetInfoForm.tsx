import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PetInfo {
  name: string;
  age: string;
  breed: string;
  color: string;
  gender: string;
  description: string;
  image: File | null;
  lastKnownLocation: { latitude: number; longitude: number };
}

const PetInfoForm: React.FC = () => {
  const navigate = useNavigate();
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: '',
    age: '',
    breed: '',
    color: '',
    gender: '',
    description: '',
    image: null,
    lastKnownLocation: { latitude: 0, longitude: 0 },
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setPetInfo((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPetInfo((prevState) => ({
        ...prevState,
        image: e.target.files![0],
      }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPetInfo((prevState) => ({
      ...prevState,
      lastKnownLocation: {
        ...prevState.lastKnownLocation,
        [name]: parseFloat(value),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.append('name', petInfo.name);
    formData.append('age', petInfo.age);
    formData.append('breed', petInfo.breed);
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
          'Authorization': token,
        },
        body: formData,
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
    <div className="min-h-screen bg-alice-blue flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-extrabold text-caribbean-current text-center mb-6">
          {step === 1 ? 'Register Your Pet' : 'Upload Pet Photo'}
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-1 gap-6">
                <InputField
                  label="Pet Name"
                  name="name"
                  value={petInfo.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Buddy"
                />
                <InputField
                  label="Age"
                  name="age"
                  value={petInfo.age}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years"
                />
                <InputField
                  label="Breed"
                  name="breed"
                  value={petInfo.breed}
                  onChange={handleInputChange}
                  placeholder="e.g., Labrador Retriever"
                />
                <InputField
                  label="Color"
                  name="color"
                  value={petInfo.color}
                  onChange={handleInputChange}
                  placeholder="e.g., Brown"
                />
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-caribbean-current">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={petInfo.gender}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-tiffany-blue rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-atomic-tangerine focus:border-atomic-tangerine sm:text-sm"
                    required
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-caribbean-current">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={petInfo.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full border border-tiffany-blue rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-atomic-tangerine focus:border-atomic-tangerine sm:text-sm"
                    placeholder="Describe your pet..."
                  ></textarea>
                </div>
                <InputField
                  label="Last Known Latitude"
                  name="latitude"
                  value={petInfo.lastKnownLocation.latitude.toString()}
                  onChange={handleLocationChange}
                  placeholder="e.g., 40.7128"
                  type="number"
                  step="0.0001"
                />
                <InputField
                  label="Last Known Longitude"
                  name="longitude"
                  value={petInfo.lastKnownLocation.longitude.toString()}
                  onChange={handleLocationChange}
                  placeholder="e.g., -74.0060"
                  type="number"
                  step="0.0001"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-caribbean-current hover:bg-atomic-tangerine focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiffany-blue transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-center items-center">
                  {petInfo.image ? (
                    <img
                      src={URL.createObjectURL(petInfo.image)}
                      alt="Pet preview"
                      className="w-64 h-64 object-cover rounded-lg shadow-md"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-pale-dogwood rounded-lg flex items-center justify-center">
                      <p className="text-caribbean-current text-lg">No image selected</p>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium text-caribbean-current mb-2">
                    Upload Pet Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full text-sm text-caribbean-current file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-tiffany-blue file:text-caribbean-current hover:file:bg-pale-dogwood"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-caribbean-current bg-pale-dogwood hover:bg-tiffany-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiffany-blue transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-caribbean-current hover:bg-atomic-tangerine focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tiffany-blue transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Register Pet
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  step?: string;
}> = ({ label, name, value, onChange, placeholder, type = "text", step }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-caribbean-current">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-tiffany-blue rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-atomic-tangerine focus:border-atomic-tangerine sm:text-sm"
      placeholder={placeholder}
      required
      step={step}
    />
  </div>
);

export default PetInfoForm;