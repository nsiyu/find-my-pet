import React from "react";
import { FaPaw, FaHeart, FaComment, FaUserCircle } from "react-icons/fa";

const Home = () => {
  const userStats = {
    petsRescued: 5,
    postsCreated: 12,
    commentsLeft: 28,
  };

  const missingPets = [
    {
      _id: "1",
      name: "Max",
      breed: "Golden Retriever",
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=724&q=80",
      createdAt: "2023-05-15T10:30:00Z",
      lastKnownLocation: { city: "San Francisco", state: "CA" },
    },
    {
      _id: "2",
      name: "Luna",
      breed: "Siamese Cat",
      imageUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
      createdAt: "2023-05-17T14:45:00Z",
      lastKnownLocation: { city: "Los Angeles", state: "CA" },
    },
    {
      _id: "3",
      name: "Rocky",
      breed: "German Shepherd",
      imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=751&q=80",
      createdAt: "2023-05-18T09:15:00Z",
      lastKnownLocation: { city: "New York", state: "NY" },
    },
  ];

  const communityPosts = [
    {
      _id: "1",
      userName: "JohnDoe",
      content: "Just rescued a beautiful tabby cat! She's now safe and sound at the local shelter.",
      createdAt: "2023-05-19T16:30:00Z",
      imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      likes: 24,
      comments: 7,
    },
    {
      _id: "2",
      userName: "EmmaW",
      content: "Reminder: Always keep your pets' ID tags up to date! It can make all the difference if they ever get lost.",
      createdAt: "2023-05-20T11:20:00Z",
      likes: 18,
      comments: 3,
    },
    {
      _id: "3",
      userName: "PetLover123",
      content: "Volunteered at the animal shelter today. So many wonderful animals looking for their forever homes!",
      createdAt: "2023-05-21T14:05:00Z",
      imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
      likes: 32,
      comments: 9,
    },
  ];

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col h-full bg-eggshell overflow-y-auto">
      <div className="p-4 pt-16 pb-32">
        <h1 className="text-3xl font-bold text-delft-blue mb-6">Welcome Home</h1>

        {/* User Stats */}
        <div className="bg-sunset rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-xl font-semibold text-delft-blue mb-3">Your Impact</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold text-burnt-sienna">{userStats.petsRescued}</p>
              <p className="text-sm text-delft-blue">Pets Rescued</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-burnt-sienna">{userStats.postsCreated}</p>
              <p className="text-sm text-delft-blue">Posts Created</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-burnt-sienna">{userStats.commentsLeft}</p>
              <p className="text-sm text-delft-blue">Comments Left</p>
            </div>
          </div>
        </div>

        {/* Missing Pets */}
        <h2 className="text-2xl font-semibold text-delft-blue mb-3">Recent Missing Pets</h2>
        <div className="space-y-4 mb-6">
          {missingPets.map((pet) => (
            <div key={pet._id} className="bg-cambridge-blue bg-opacity-20 rounded-xl shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <img
                    src={pet.imageUrl}
                    alt={pet.name}
                    className="w-16 h-16 object-cover rounded-full mr-4 border-2 border-burnt-sienna"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-delft-blue">{pet.name}</h3>
                    <p className="text-burnt-sienna">{pet.breed}</p>
                  </div>
                </div>
                <p className="text-delft-blue mb-2">
                  <span className="font-semibold">Last seen:</span> {formatDate(pet.createdAt)}
                </p>
                <p className="text-delft-blue">
                  <span className="font-semibold">Location:</span> {pet.lastKnownLocation.city}, {pet.lastKnownLocation.state}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Community Posts */}
        <h2 className="text-2xl font-semibold text-delft-blue mb-3">Community Posts</h2>
        <div className="space-y-4">
          {communityPosts.map((post) => (
            <div key={post._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-2">
                  <FaUserCircle className="text-3xl text-delft-blue mr-2" />
                  <div>
                    <h3 className="font-semibold text-delft-blue">{post.userName}</h3>
                    <p className="text-sm text-burnt-sienna">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-delft-blue mb-2">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-48 object-cover rounded-md mb-2"
                  />
                )}
                <div className="flex justify-between items-center">
                  <button className="flex items-center text-burnt-sienna">
                    <FaHeart className="mr-1" />
                    <span>{post.likes} Likes</span>
                  </button>
                  <button className="flex items-center text-burnt-sienna">
                    <FaComment className="mr-1" />
                    <span>{post.comments} Comments</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;