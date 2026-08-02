import { useState } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

const ChatInput = ({
  onSend,
  loading = false,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (
    <div className="border-t p-4 flex gap-3 bg-white dark:bg-gray-800">
      <input
        className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Ask anything about your PDF..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
      />

      <button
        disabled={loading}
        onClick={send}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 disabled:opacity-50"
      >
        <SendHorizontal size={20} />
      </button>
    </div>
  );
};

export default ChatInput;