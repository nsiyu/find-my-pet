import React, { useState, useEffect } from "react";
import { FaPaw, FaHeart, FaComment } from "react-icons/fa";

const PetCorner = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // Simulating API call to fetch posts
    setLoading(true);
    try {
      // Replace this with actual API call when backend is ready
      const response = await fetch("http://10.0.1.230:5001/pet-posts");
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId) => {
    // Implement like functionality
    console.log("Liked post:", postId);
  };

  const handleComment = (postId) => {
    // Implement comment functionality
    console.log("Commenting on post:", postId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        <FaPaw className="inline-block mr-2" />
        Pet Corner
      </h1>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center mb-2">
              <img
                src={post.userAvatar}
                alt={post.userName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold">{post.userName}</h3>
                <p className="text-sm text-gray-500">{post.timestamp}</p>
              </div>
            </div>
            <p className="mb-2">{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-full h-64 object-cover rounded-md mb-2"
              />
            )}
            <div className="flex justify-between items-center">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center text-gray-600 hover:text-blue-500"
              >
                <FaHeart className="mr-1" />
                <span>{post.likes} Likes</span>
              </button>
              <button
                onClick={() => handleComment(post.id)}
                className="flex items-center text-gray-600 hover:text-blue-500"
              >
                <FaComment className="mr-1" />
                <span>{post.comments} Comments</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetCorner;
