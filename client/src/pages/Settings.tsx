import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Moon, Sun } from "lucide-react";

import Layout from "../components/common/Layout";
import useAuth from "../hooks/useAuth";
import { useThemeContext } from "../context/ThemeContext";
import chatService, { ChatSessionSummary } from "../services/chatService";

interface Capabilities {
  llm: boolean;
  externalSearch: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useThemeContext();
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);

  useEffect(() => {
    chatService
      .getSessions()
      .then(setSessions)
      .catch(() => undefined);

    // /health sits outside /api, so derive its URL from the configured base.
    const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

    fetch(`${apiBase.replace(/\/api\/?$/, "")}/health`)
      .then((response) => response.json())
      .then((data) =>
        setCapabilities({
          llm: Boolean(data.llm),
          externalSearch: Boolean(data.externalSearch),
        })
      )
      .catch(() => undefined);
  }, []);

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    try {
      await chatService.clearChat(id);
      setSessions((prev) => prev.filter((session) => session.id !== id));
      toast.success("Conversation deleted");
    } catch {
      toast.error("Could not delete that conversation");
    }
  };

  return (
    <Layout>

      <div className="max-w-4xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold">Settings</h1>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currently {theme}. Saved to this browser.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 border dark:border-gray-600 rounded-lg"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              Switch to {theme === "dark" ? "light" : "dark"}
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Signed in as <span className="font-medium">{user?.email}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Change your name or password on the Profile page.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">AI Capabilities</h2>

          {!capabilities ? (
            <p className="text-gray-500 dark:text-gray-400">
              Could not reach the backend.
            </p>
          ) : (
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Text generation (chat, summaries, MCQs)</span>
                <span
                  className={
                    capabilities.llm ? "text-green-600" : "text-red-600"
                  }
                >
                  {capabilities.llm ? "Enabled" : "Set OPENAI_API_KEY"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>External web search fallback</span>
                <span
                  className={
                    capabilities.externalSearch
                      ? "text-green-600"
                      : "text-gray-500 dark:text-gray-400"
                  }
                >
                  {capabilities.externalSearch
                    ? "Enabled"
                    : "Set TAVILY_API_KEY"}
                </span>
              </li>
            </ul>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Conversations ({sessions.length})
          </h2>

          {sessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No saved conversations.
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {session.messageCount} messages ·{" "}
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSession(session.id)}
                    className="text-red-600 hover:text-red-800 shrink-0 ml-4"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

    </Layout>
  );
};

export default Settings;
