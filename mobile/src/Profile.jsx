import React, { useState, useEffect } from "react";
import { FaPaw, FaCamera, FaEdit, FaMedal, FaHeart } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Li Shen",
    email: "john.doe@example.com",
    avatar: "https://media.licdn.com/dms/image/D5603AQHqi709BbDMqQ/profile-displayphoto-shrink_200_200/0/1702948465172?e=2147483647&v=beta&t=CRhUNQ1Jv-OLxZTjfKckLYkR8PdeQ-qgxqFAw3L8b1c",
    bio: "Animal lover and pet rescue enthusiast",
    petsRescued: 5,
    postsCreated: 12,
    commentsLeft: 28,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [foundPets, setFoundPets] = useState([]);

  useEffect(() => {
    const fetchFoundPets = async () => {
      try {
        const response = await fetch("http://10.0.1.17:5001/found-pets");
        const data = await response.json();
        setFoundPets(data.pets);
      } catch (error) {
        console.error("Error fetching found pets:", error);
      }
    };

    fetchFoundPets();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col h-full bg-eggshell overflow-y-auto">
      <div className="p-4 pt-16 pb-32">
        <div className="relative mb-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-32 h-32 rounded-full mx-auto border-4 border-burnt-sienna"
          />
          <button className="absolute bottom-0 right-1/2 transform translate-x-16 translate-y-3 bg-delft-blue text-eggshell p-2 rounded-full">
            <FaCamera />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full p-2 border border-cambridge-blue rounded-md"
            />
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full p-2 border border-cambridge-blue rounded-md"
            />
            <textarea
              name="bio"
              value={user.bio}
              onChange={handleChange}
              className="w-full p-2 border border-cambridge-blue rounded-md"
            />
            <button
              onClick={handleSave}
              className="w-full p-2 bg-delft-blue text-eggshell rounded-md hover:bg-burnt-sienna transition-colors"
            >
              Save Profile
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-delft-blue mb-2 text-center">
              {user.name}
            </h1>
            <p className="text-burnt-sienna mb-4 text-center">{user.email}</p>
            <p className="text-delft-blue mb-6 text-center">{user.bio}</p>
            <button
              onClick={handleEdit}
              className="flex items-center justify-center w-full p-2 bg-cambridge-blue text-eggshell rounded-md hover:bg-delft-blue transition-colors mb-6"
            >
              <FaEdit className="mr-2" /> Edit Profile
            </button>
          </>
        )}

        <div className="bg-sunset rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-delft-blue mb-3">Your Impact</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold text-burnt-sienna">{user.petsRescued}</p>
              <p className="text-sm text-delft-blue">Pets Rescued</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-burnt-sienna">{user.postsCreated}</p>
              <p className="text-sm text-delft-blue">Posts Created</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-burnt-sienna">{user.commentsLeft}</p>
              <p className="text-sm text-delft-blue">Comments Left</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-delft-blue mb-3">Achievements</h2>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center">
            <FaPaw className="text-3xl text-burnt-sienna mr-4" />
            <div>
              <h3 className="font-semibold text-delft-blue">Paw-some Rescuer</h3>
              <p className="text-sm text-burnt-sienna">Rescued 5 pets</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center">
            <FaMedal className="text-3xl text-burnt-sienna mr-4" />
            <div>
              <h3 className="font-semibold text-delft-blue">Community Champion</h3>
              <p className="text-sm text-burnt-sienna">Created 10+ posts</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center">
            <FaHeart className="text-3xl text-burnt-sienna mr-4" />
            <div>
              <h3 className="font-semibold text-delft-blue">Compassionate Commenter</h3>
              <p className="text-sm text-burnt-sienna">Left 25+ comments</p>
            </div>
          </div>
        </div>

        {/* Found Pets Section */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-delft-blue mb-3">Pets You've Found</h2>
          <div className="space-y-4">
            {foundPets.map((pet) => (
              <div key={pet._id} className="bg-white rounded-xl shadow-md p-4 flex items-center">
                <img
                  src={pet.pictureUrl || 'default-pet-image.jpg'}
                  alt={`Found ${pet.petType}`}
                  className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-burnt-sienna"
                />
                <div>
                  <h3 className="font-semibold text-delft-blue">{pet.petType}</h3>
                  <p className="text-sm text-burnt-sienna">Found on: {new Date(pet.date).toLocaleDateString()}</p>
                  <p className="text-sm text-burnt-sienna">Shelter: {pet.shelter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;