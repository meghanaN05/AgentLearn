import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Layout from "../components/common/Layout";
import ChatWindow from "../components/chat/ChatWindow";
import ChatSessionList from "../components/chat/ChatSessionList";

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | undefined>();
  // Bumped whenever the transcript changes, so the sidebar re-reads titles,
  // message counts and ordering.
  const [refreshToken, setRefreshToken] = useState(0);

  // Deep links: ?session=<id> resumes a chat, ?q=<text> seeds a first question
  // (used by the recommendation cards).
  const resumeId = searchParams.get("session") ?? undefined;
  const seededQuestion = searchParams.get("q") ?? undefined;

  useEffect(() => {
    if (resumeId) {
      setSessionId(resumeId);
    }
  }, [resumeId]);

  const selectSession = (id: string) => {
    setSessionId(id);
    setSearchParams({ session: id }, { replace: true });
  };

  const startNewChat = () => {
    setSessionId(undefined);
    setSearchParams({}, { replace: true });
  };

  return (
    <Layout>

      <h1 className="text-3xl font-bold mb-6">Chat</h1>

      <div className="flex gap-6 items-stretch h-[calc(100vh-190px)] min-h-[520px]">

        <ChatSessionList
          activeSessionId={sessionId}
          refreshToken={refreshToken}
          onSelect={selectSession}
          onNewChat={startNewChat}
        />

        <div className="flex-1 min-w-0">
          <ChatWindow
            sessionId={sessionId}
            seededQuestion={seededQuestion}
            onSessionChange={selectSession}
            onTranscriptChange={() => setRefreshToken((value) => value + 1)}
          />
        </div>

      </div>

    </Layout>
  );
};

export default Chat;
