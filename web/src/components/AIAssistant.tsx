import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaw, FaRegPaperPlane } from "react-icons/fa";
import axios from "axios";
import Lottie from "react-lottie";
import dogAnimation from "../assets/dog-animation.json"; // You'll need to add this JSON file

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState("");
  const [conversation, setConversation] = useState<
    { role: string; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setConversation((prev) => [...prev, newMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant named PetFinder, specialized in helping people locate missing pets, particularly dogs. You are currently assisting an owner whose Border Collie named Li Shen is missing. Your primary functions are:

1. Provide emotional support: Offer empathy and reassurance to the owner who is distressed about their lost Border Collie, Li Shen.
2. Give practical advice: Suggest immediate actions and long-term strategies for finding Li Shen, tailored to Border Collie behavior and characteristics.
3. Offer breed-specific insights: Provide information about common behaviors of Border Collies that might help in the search for Li Shen.
4. Explain FindMyPet app features: When relevant, describe how to use the app's functionalities for reporting and searching for Li Shen.
5. Suggest local resources: Recommend contacting local shelters, veterinarians, and using community networks that might be helpful in finding a Border Collie.
6. Provide safety tips: Advise on safe search practices for both Li Shen and the owner.
7. Answer questions: Respond to any queries about pet recovery, local laws, or other topics related to finding Li Shen.

Always prioritize the well-being of both Li Shen and the owner. Tailor your responses to the specific details provided about Li Shen, such as his appearance, age, or any unique characteristics. If you don't have enough information, ask clarifying questions to provide more accurate assistance in finding this specific Border Collie.`,
          },
          ...conversation,
          newMessage,
        ],
      };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        payload,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = {
        role: "assistant",
        content: response.data.choices[0].message.content,
      };
      setConversation((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "I apologize, but I encountered an error. Please try again later.",
      };
      setConversation((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: dogAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-alice-blue to-pale-dogwood py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 relative">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="mr-4 text-caribbean-current hover:text-atomic-tangerine transition-colors"
          >
            <FaArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-bold text-caribbean-current flex items-center">
            <FaPaw className="mr-2 text-atomic-tangerine" /> AI Pet Finder Assistant
          </h2>
        </div>
        <div className="absolute top-4 right-4 w-24 h-24 -mt-6">
          <Lottie options={defaultOptions} />
        </div>
        <div
          ref={chatContainerRef}
          className="mb-4 h-96 overflow-y-auto border border-tiffany-blue rounded-md p-4 bg-alice-blue"
        >
          {conversation.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-tiffany-blue text-white"
                    : "bg-pale-dogwood text-caribbean-current"
                }`}
              >
                {message.content}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="text-center">
              <span className="inline-block p-2 rounded-lg bg-gray-200 animate-pulse">
                AI is thinking...
              </span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-grow p-3 border border-tiffany-blue rounded-l-md focus:outline-none focus:ring-2 focus:ring-atomic-tangerine"
            placeholder="Ask about finding Li Shen..."
          />
          <button
            type="submit"
            className="px-6 py-3 bg-atomic-tangerine text-white rounded-r-md hover:bg-caribbean-current transition-colors flex items-center"
            disabled={isLoading}
          >
            <FaRegPaperPlane className="mr-2" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;