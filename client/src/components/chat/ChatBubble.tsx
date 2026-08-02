import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const ChatBubble = ({ message, isUser, timestamp }: ChatBubbleProps) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message}</p>
        ) : (
          // Answers come back as markdown with headings, lists and fenced code
          // blocks; rendering them as plain text made them near-unreadable.
          <div className="space-y-2 text-sm leading-relaxed break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h3 className="text-base font-semibold mt-3">{children}</h3>
                ),
                h2: ({ children }) => (
                  <h3 className="text-base font-semibold mt-3">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="font-semibold mt-3">{children}</h4>
                ),
                p: ({ children }) => <p className="my-2">{children}</p>,
                ul: ({ children }) => (
                  <ul className="list-disc list-inside my-2 space-y-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside my-2 space-y-1">
                    {children}
                  </ol>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    {children}
                  </a>
                ),
                code: ({ className, children }) => {
                  // Fenced blocks carry a language class; inline code does not.
                  const isBlock = Boolean(className);

                  if (!isBlock) {
                    return (
                      <code className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-600 font-mono text-[0.85em]">
                        {children}
                      </code>
                    );
                  }

                  return (
                    <code className="block overflow-x-auto p-3 rounded-lg bg-gray-900 text-gray-100 font-mono text-xs whitespace-pre">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="my-2">{children}</pre>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="text-xs border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border dark:border-gray-600 px-2 py-1 text-left">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border dark:border-gray-600 px-2 py-1">
                    {children}
                  </td>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}

        {timestamp && (
          <p
            className={`text-xs mt-2 ${
              isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
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
