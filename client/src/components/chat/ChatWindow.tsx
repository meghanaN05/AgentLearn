import { useState } from "react";
import ChatInput from "./ChatInput";
import ChatHistory, { Message } from "./ChatHistory";
import SuggestedQuestions from "./SuggestedQuestions";

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Temporary AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: "This is a placeholder AI response. Replace it with your FastAPI/LangGraph API call.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[80vh] bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 overflow-y-auto flex-1">
        <SuggestedQuestions onSelect={sendMessage} />

        <ChatHistory messages={messages} />
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
};

export default ChatWindow;