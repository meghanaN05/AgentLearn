import { useState } from "react";
import toast from "react-hot-toast";

import chatService from "../../services/chatService";
import ChatInput from "./ChatInput";
import ChatHistory, { Message } from "./ChatHistory";
import SuggestedQuestions from "./SuggestedQuestions";
import Loader from "../common/Loader";

const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        message: text,
        sessionId,
      });

      setSessionId(response.sessionId);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        text: response.answer,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      toast.error("Failed to get AI response. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 overflow-y-auto flex-1">
        <SuggestedQuestions onSelect={sendMessage} />

        <ChatHistory messages={messages} />

        {loading && (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        )}
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatWindow;
