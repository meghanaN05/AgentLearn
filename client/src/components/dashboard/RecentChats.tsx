import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import chatService, { ChatSessionSummary } from "../../services/chatService";

const RecentChats = () => {
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await chatService.getSessions();
        setSessions(data.slice(0, 5));
      } catch {
        // The dashboard stays usable if this panel cannot load.
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-4">
        Recent Chats
      </h2>

      {loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}

      {!loading && sessions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No conversations yet. Start one from the Chat page.
        </p>
      )}

      <div className="space-y-3">

        {sessions.map((session) => (

          <button
            key={session.id}
            type="button"
            onClick={() => navigate(`/chat?session=${session.id}`)}
            className="w-full text-left border rounded-lg p-3 hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-medium truncate">{session.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session.messageCount} messages
            </p>
          </button>

        ))}

      </div>

    </div>
  );
};

export default RecentChats;
