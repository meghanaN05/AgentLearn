import ChatBubble from "./ChatBubble";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

interface Props {
  messages: Message[];
}

const ChatHistory = ({ messages }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg.text}
          isUser={msg.isUser}
          timestamp={msg.timestamp}
        />
      ))}
    </div>
  );
};

export default ChatHistory;