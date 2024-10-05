import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: 'user', content: userInput };
    setConversation([...conversation, newMessage]);
    setUserInput('');

    const aiResponse = { role: 'assistant', content: `You said: ${userInput}` };
    setConversation(prev => [...prev, aiResponse]);
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
          <h2 className="text-3xl font-bold text-caribbean-current">AI Assistant</h2>
        </div>
        <div className="mb-4 h-96 overflow-y-auto border border-tiffany-blue rounded-md p-4">
          {conversation.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-tiffany-blue text-white' : 'bg-pale-dogwood'}`}>
                {message.content}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-grow p-2 border border-tiffany-blue rounded-l-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
            placeholder="Type your message here..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-atomic-tangerine text-white rounded-r-md hover:bg-caribbean-current transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;