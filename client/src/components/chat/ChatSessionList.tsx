import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, MessageSquarePlus, Pencil, Search, Trash2, X } from "lucide-react";

import chatService, { ChatSessionSummary } from "../../services/chatService";
import useDebounce from "../../hooks/useDebounce";

interface Props {
  activeSessionId?: string;
  /** Bumped by the parent after a message is sent, to refresh titles and order. */
  refreshToken: number;
  onSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

const ChatSessionList = ({
  activeSessionId,
  refreshToken,
  onSelect,
  onNewChat,
}: Props) => {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    chatService
      .getSessions(debouncedSearch || undefined)
      .then((data) => {
        if (!cancelled) {
          setSessions(data);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, refreshToken]);

  const startRename = (session: ChatSessionSummary) => {
    setEditingId(session.id);
    setDraftTitle(session.title);
  };

  const commitRename = async (sessionId: string) => {
    const title = draftTitle.trim();

    if (!title) {
      setEditingId(null);
      return;
    }

    // Optimistic: renaming is cheap and reverting on failure is less jarring
    // than a spinner on a text field.
    const previous = sessions;
    setSessions((prev) =>
      prev.map((item) => (item.id === sessionId ? { ...item, title } : item))
    );
    setEditingId(null);

    try {
      await chatService.renameSession(sessionId, title);
    } catch {
      setSessions(previous);
      toast.error("Could not rename that chat");
    }
  };

  const handleDelete = async (session: ChatSessionSummary) => {
    if (!window.confirm(`Delete "${session.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await chatService.clearChat(session.id);
      setSessions((prev) => prev.filter((item) => item.id !== session.id));

      if (session.id === activeSessionId) {
        onNewChat();
      }

      toast.success("Chat deleted");
    } catch {
      toast.error("Could not delete that chat");
    }
  };

  return (
    <aside className="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">

      <div className="p-3 border-b dark:border-gray-700 space-y-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          <MessageSquarePlus size={16} />
          New chat
        </button>

        <div className="flex items-center gap-2 border dark:border-gray-600 rounded-lg px-2 py-1.5">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            className="w-full text-sm outline-none bg-transparent"
            placeholder="Search chats"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {/* Excluded from Lenis so the wheel scrolls this list, not the page. */}
      <div data-lenis-prevent className="flex-1 overflow-y-auto p-2">

        {loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
            Loading...
          </p>
        )}

        {!loading && sessions.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 p-2">
            {debouncedSearch
              ? `No chats match "${debouncedSearch}".`
              : "No conversations yet."}
          </p>
        )}

        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;

          if (editingId === session.id) {
            return (
              <div
                key={session.id}
                className="flex items-center gap-1 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <input
                  autoFocus
                  className="w-full text-sm bg-transparent outline-none"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") commitRename(session.id);
                    if (event.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  type="button"
                  aria-label="Save name"
                  onClick={() => commitRename(session.id)}
                  className="text-green-600 shrink-0"
                >
                  <Check size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Cancel rename"
                  onClick={() => setEditingId(null)}
                  className="text-gray-500 dark:text-gray-400 shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={session.id}
              className={`group flex items-center gap-1 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                className="flex-1 text-left p-2 min-w-0"
              >
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p
                  className={`text-xs truncate ${
                    isActive
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {session.messageCount} messages ·{" "}
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
              </button>

              <div className="flex items-center gap-1 pr-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  aria-label={`Rename ${session.title}`}
                  onClick={() => startRename(session)}
                  className={isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${session.title}`}
                  onClick={() => handleDelete(session)}
                  className={isActive ? "text-blue-100" : "text-red-500"}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

      </div>

    </aside>
  );
};

export default ChatSessionList;
