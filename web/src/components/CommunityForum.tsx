import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaPlus } from 'react-icons/fa';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  likes: number;
  comments: number;
}

const CommunityForum: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch posts from API
    // For now, we'll use dummy data
    const dummyPosts: Post[] = [
      {
        id: '1',
        title: 'Tips for finding a lost cat',
        content: 'Here are some effective strategies I\'ve used to find lost cats...',
        author: 'CatLover123',
        date: '2023-06-15',
        likes: 24,
        comments: 7,
      },
      {
        id: '2',
        title: 'Dog-friendly parks in the city',
        content: 'I\'ve compiled a list of the best dog-friendly parks in our city...',
        author: 'PuppyPal',
        date: '2023-06-14',
        likes: 18,
        comments: 5,
      },
      // Add more dummy posts as needed
    ];
    setPosts(dummyPosts);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-alice-blue p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-caribbean-current">Community Forum</h1>
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-caribbean-current text-white rounded-full hover:bg-atomic-tangerine transition duration-300"
        >
          <FaHome size={24} />
        </button>
      </header>

      <div className="mb-8 flex justify-between items-center">
        <div className="relative flex-grow mr-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 pl-10 border border-tiffany-blue rounded-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-caribbean-current" />
        </div>
        <button className="flex items-center space-x-2 bg-atomic-tangerine text-white px-4 py-2 rounded-lg hover:bg-caribbean-current transition duration-300">
          <FaPlus />
          <span>New Post</span>
        </button>
      </div>

      <div className="space-y-6">
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-caribbean-current mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.content.substring(0, 150)}...</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>By {post.author} on {new Date(post.date).toLocaleDateString()}</span>
              <div>
                <span className="mr-4">{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityForum;