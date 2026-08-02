/** Sits in the message stream where the answer will appear, so the
 *  conversation does not jump when the response arrives. */
const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="rounded-2xl px-4 py-3 shadow-md bg-gray-100 dark:bg-gray-700">
        <div className="flex items-center gap-1.5" aria-label="Assistant is typing">
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
