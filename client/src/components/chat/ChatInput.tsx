import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

const MAX_ROWS_PX = 160;

const ChatInput = ({ onSend, loading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow with the content up to a cap, instead of a single-line input that
  // hides everything but the last few words of a long question.
  useEffect(() => {
    const node = textareaRef.current;

    if (node) {
      node.style.height = "auto";
      node.style.height = `${Math.min(node.scrollHeight, MAX_ROWS_PX)}px`;
    }
  }, [message]);

  // Return focus once a response lands so the next question can be typed
  // straight away.
  useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  const send = () => {
    if (!message.trim() || loading) {
      return;
    }

    onSend(message.trim());
    setMessage("");
  };

  return (
    <div className="border-t dark:border-gray-700 p-4 flex gap-3 bg-white dark:bg-gray-800 shrink-0">
      <textarea
        ref={textareaRef}
        rows={1}
        className="flex-1 resize-none border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        placeholder={
          loading ? "Waiting for a response..." : "Ask anything about your PDF..."
        }
        value={message}
        disabled={loading}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          // Enter sends; Shift+Enter inserts a newline.
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
          }
        }}
      />

      <button
        type="button"
        disabled={loading || !message.trim()}
        onClick={send}
        aria-label="Send message"
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 disabled:opacity-50 self-end h-[46px]"
      >
        <SendHorizontal size={20} />
      </button>
    </div>
  );
};

export default ChatInput;
