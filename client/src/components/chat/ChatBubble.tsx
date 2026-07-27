interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatBubble = ({
  message,
  isUser,
  timestamp,
}: ChatBubbleProps) => {
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-4`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        <p className="whitespace-pre-wrap">{message}</p>

        {timestamp && (
          <p
            className={`text-xs mt-2 ${
              isUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;