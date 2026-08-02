import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { ArrowDown } from "lucide-react";

import chatService from "../../services/chatService";
import pdfService, { PDFResponse } from "../../services/pdfService";
import ChatInput from "./ChatInput";
import ChatHistory, { Message } from "./ChatHistory";
import SuggestedQuestions from "./SuggestedQuestions";
import TypingIndicator from "./TypingIndicator";

interface Props {
  /** Owned by the Chat page so the session list stays in sync. */
  sessionId?: string;
  /** Asked automatically once, when arriving from a recommendation. */
  seededQuestion?: string;
  onSessionChange: (sessionId: string) => void;
  onTranscriptChange: () => void;
}

const ChatWindow = ({
  sessionId,
  seededQuestion,
  onSessionChange,
  onTranscriptChange,
}: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [usedExternalSearch, setUsedExternalSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Guards against re-asking the seeded question on every re-render.
  const seededRef = useRef<string | null>(null);
  const loadingRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const node = scrollRef.current;

    if (node) {
      node.scrollTo({ top: node.scrollHeight, behavior });
    }
  }, []);

  // Track whether the user has scrolled up to read earlier messages, so a new
  // answer never yanks them back down mid-read.
  const handleScroll = () => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;

    setAtBottom(distanceFromBottom < 80);
  };

  // useLayoutEffect so the jump happens before paint, not as a visible scroll.
  useLayoutEffect(() => {
    if (atBottom) {
      scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]);

  useEffect(() => {
    pdfService
      .getPDFs()
      .then(setPdfs)
      .catch(() => undefined);
  }, []);

  // Load (or clear) the transcript whenever the selected session changes.
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      setSources([]);
      return;
    }

    let cancelled = false;

    chatService
      .getChatHistory(sessionId)
      .then((history) => {
        if (cancelled) {
          return;
        }

        setMessages(
          history.map((entry) => ({
            id: entry.id,
            text: entry.content,
            isUser: entry.role === "user",
            timestamp: new Date(entry.created_at).toLocaleTimeString(),
          }))
        );
        setSources([]);
        requestAnimationFrame(() => scrollToBottom("auto"));
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Could not load that conversation");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [sessionId, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (loadingRef.current) {
        return;
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        text,
        isUser: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setSources([]);
      setAtBottom(true);
      loadingRef.current = true;
      setLoading(true);

      try {
        const response = await chatService.sendMessage({
          message: text,
          sessionId,
          pdfId: selectedPdfId || undefined,
        });

        if (response.sessionId !== sessionId) {
          onSessionChange(response.sessionId);
        }

        setSources(response.sources ?? []);
        setUsedExternalSearch(Boolean(response.externalSearchUsed));

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: response.answer,
            isUser: false,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        onTranscriptChange();
      } catch (error: unknown) {
        // Drop the optimistic message so the transcript matches the server.
        setMessages((prev) => prev.filter((item) => item.id !== userMessage.id));

        const detail =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as { response?: { data?: { detail?: string } } })
            .response?.data?.detail === "string"
            ? (error as { response: { data: { detail: string } } }).response
                .data.detail
            : "Failed to get a response. Is the backend running?";

        toast.error(detail);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [sessionId, selectedPdfId, onSessionChange, onTranscriptChange]
  );

  // Fire a question passed in via ?q=, exactly once per distinct question.
  useEffect(() => {
    if (!seededQuestion || sessionId || seededRef.current === seededQuestion) {
      return;
    }

    seededRef.current = seededQuestion;
    sendMessage(seededQuestion);
  }, [seededQuestion, sessionId, sendMessage]);

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {pdfs.length > 0 && (
        <div className="p-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0 flex items-center gap-3">
          <label className="text-sm font-medium shrink-0">Answer from</label>
          <select
            className="flex-1 border rounded-lg p-2 text-sm"
            value={selectedPdfId}
            onChange={(event) => setSelectedPdfId(event.target.value)}
          >
            <option value="">All my documents</option>
            {pdfs.map((pdf) => (
              <option key={pdf.id} value={pdf.id}>
                {pdf.filename}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* data-lenis-prevent: page-level smooth scrolling must not swallow the
          wheel here, or this transcript would never scroll and the auto-scroll
          above would fight Lenis's interpolation. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        data-lenis-prevent
        className="flex-1 overflow-y-auto p-6"
      >
        {isEmpty && !loading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-semibold mb-2">
              Ask anything about your documents
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Answers are grounded in your uploaded PDFs and cite the pages they
              came from.
            </p>
            <SuggestedQuestions onSelect={sendMessage} />
          </div>
        ) : (
          <>
            <ChatHistory messages={messages} />

            {loading && <TypingIndicator />}

            {!loading && sources.length > 0 && (
              <div className="mt-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                <p className="font-medium">
                  Sources{usedExternalSearch ? " (includes web search)" : ""}:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {sources.map((source) => (
                    <span
                      key={source}
                      className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Only shown when the user has scrolled away from the latest message. */}
      {!atBottom && !isEmpty && (
        <button
          type="button"
          onClick={() => {
            setAtBottom(true);
            scrollToBottom();
          }}
          aria-label="Jump to latest message"
          className="absolute bottom-24 right-6 p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        >
          <ArrowDown size={18} />
        </button>
      )}

      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatWindow;
