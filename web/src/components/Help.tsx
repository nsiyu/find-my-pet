import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Help: React.FC = () => {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How do I report a lost pet?",
      answer: "To report a lost pet, click on the 'Register a Pet' button on the dashboard and fill out the form with your pet's details."
    },
    {
      question: "How can I search for a found pet?",
      answer: "Use the 'Quick Search' feature on the dashboard or click 'Browse Full Database' to see all registered pets."
    },
    {
      question: "What should I do if I find a lost pet?",
      answer: "If you find a lost pet, you can register it in our database using the 'Register a Pet' form. Make sure to select 'Found' as the status."
    },
    {
      question: "How does the AI Assistant work?",
      answer: "The AI Assistant can help you with various tasks related to lost and found pets. Simply type your question or request, and it will provide guidance based on our extensive database and algorithms."
    },
    {
      question: "Can I update the information for a pet I've registered?",
      answer: "Yes, you can update the information for pets you've registered. Go to the pet's profile page and click on the 'Edit' button to make changes."
    }
  ];

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
          <h2 className="text-3xl font-bold text-caribbean-current">Help Center</h2>
        </div>
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-tiffany-blue pb-4">
              <h3 className="text-xl font-semibold text-caribbean-current mb-2">{item.question}</h3>
              <p className="text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;