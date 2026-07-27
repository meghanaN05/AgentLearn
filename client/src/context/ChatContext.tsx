import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import chatService from "../services/chatService";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  loading: boolean;
  sessionId: string | null;

  sendMessage: (
    message: string,
    pdfId?: string
  ) => Promise<void>;

  clearChat: () => Promise<void>;

  setMessages: React.Dispatch<
    React.SetStateAction<ChatMessage[]>
  >;
}

const ChatContext = createContext<
  ChatContextType | undefined
>(undefined);

interface Props {
  children: ReactNode;
}

export const ChatProvider = ({
  children,
}: Props) => {
  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const sendMessage = async (
    message: string,
    pdfId?: string
  ) => {
    setLoading(true);

    try {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        userMessage,
      ]);

      const response =
        await chatService.sendMessage({
          message,
          pdfId,
          sessionId: sessionId ?? undefined,
        });

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        aiMessage,
      ]);

      setSessionId(response.sessionId);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      await chatService.clearChat(sessionId);
    }

    setMessages([]);
    setSessionId(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        sessionId,
        sendMessage,
        clearChat,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error(
      "useChatContext must be used within ChatProvider"
    );
  }

  return context;
};