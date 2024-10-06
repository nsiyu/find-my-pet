import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPaw } from "react-icons/fa";
import axios from "axios";

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
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setConversation((prev) => [...prev, newMessage]);
    setUserInput("");
    setIsLoading(true);

    // Debug: Log user input and conversation state
    console.log("User Input:", userInput);
    console.log("Current Conversation:", [...conversation, newMessage]);

    try {
      // Debug: Check if API key is loaded
      console.log(
        "OpenAI API Key:",
        import.meta.env.VITE_OPENAI_API_KEY
          ? "Loaded"
          : "Not Found or Undefined"
      );

      // Optional: Log the exact API key (ONLY FOR DEBUGGING)
      // ⚠️ Remove this in production!
      // console.log("Actual API Key:", import.meta.env.VITE_OPENAI_API_KEY);

      // Construct the request payload
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in helping people find missing pets. 
Provide empathetic, practical advice on steps to take, resources to use, and best practices for locating lost pets. 
Focus on local search methods, online resources, and community engagement. 
If asked about the FindMyPet app, explain its features for reporting and searching for lost pets.
Always prioritize the safety and well-being of both the pet and the searcher.`,
          },
          ...conversation,
          newMessage,
        ],
      };

      // Debug: Log the request payload
      console.log("Request Payload:", payload);

      // Make the API request
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

      // Debug: Log the response from OpenAI
      console.log("OpenAI Response:", response.data);

      // Extract AI response
      const aiResponse = {
        role: "assistant",
        content: response.data.choices[0].message.content,
      };
      setConversation((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      // Detailed Error Logging
      if (axios.isAxiosError(error)) {
        console.error("Axios Error Details:", {
          message: error.message,
          response: error.response
            ? {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
              }
            : "No response received",
          config: error.config,
        });
      } else {
        console.error("Unexpected Error:", error);
      }

      // Add error message to conversation
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

  return (
    <div className="min-h-screen bg-alice-blue py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="mr-4 text-caribbean-current hover:text-atomic-tangerine transition-colors"
          >
            <FaArrowLeft size={24} />
          </button>
          <h2 className="text-3xl font-bold text-caribbean-current flex items-center">
            <FaPaw className="mr-2" /> AI Pet Finder Assistant
          </h2>
        </div>
        <div
          ref={chatContainerRef}
          className="mb-4 h-96 overflow-y-auto border border-tiffany-blue rounded-md p-4"
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
              <span className="inline-block p-2 rounded-lg bg-gray-200">
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
            placeholder="Ask about finding missing pets..."
          />
          <button
            type="submit"
            className="px-6 py-3 bg-atomic-tangerine text-white rounded-r-md hover:bg-caribbean-current transition-colors"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
