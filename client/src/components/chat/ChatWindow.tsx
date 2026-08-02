import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import chatService from "../../services/chatService";
import pdfService, { PDFResponse } from "../../services/pdfService";
import ChatInput from "./ChatInput";
import ChatHistory, { Message } from "./ChatHistory";
import SuggestedQuestions from "./SuggestedQuestions";
import Loader from "../common/Loader";

const ChatWindow = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [usedExternalSearch, setUsedExternalSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    pdfService
      .getPDFs()
      .then(setPdfs)
      .catch(() => undefined);
  }, []);

  // Resume a conversation linked from the dashboard (/chat?session=<id>).
  useEffect(() => {
    const resumeId = searchParams.get("session");

    if (!resumeId) {
      return;
    }

    chatService
      .getChatHistory(resumeId)
      .then((history) => {
        setSessionId(resumeId);
        setMessages(
          history.map((entry) => ({
            id: entry.id,
            text: entry.content,
            isUser: entry.role === "user",
            timestamp: new Date(entry.created_at).toLocaleTimeString(),
          }))
        );
      })
      .catch(() => toast.error("Could not load that conversation"));
  }, [searchParams]);

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await chatService.sendMessage({
        message: text,
        sessionId,
        pdfId: selectedPdfId || undefined,
      });

      setSessionId(response.sessionId);
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
    } catch (error: unknown) {
      // Drop the optimistic message so the transcript matches the server.
      setMessages((prev) => prev.filter((item) => item.id !== userMessage.id));

      const detail =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response
          ?.data?.detail === "string"
          ? (error as { response: { data: { detail: string } } }).response.data
              .detail
          : "Failed to get a response. Is the backend running?";

      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      {pdfs.length > 0 && (
        <div className="p-4 border-b bg-white">
          <label className="block text-sm font-medium mb-1">
            Answer from
          </label>
          <select
            className="w-full border rounded-lg p-2"
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

      <div className="p-6 overflow-y-auto flex-1">
        <SuggestedQuestions onSelect={sendMessage} />

        <ChatHistory messages={messages} />

        {loading && (
          <div className="flex justify-center py-4">
            <Loader />
          </div>
        )}

        {!loading && sources.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">
              Sources{usedExternalSearch ? " (includes web search)" : ""}:
            </p>
            <ul className="list-disc list-inside">
              {sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  );
};

export default ChatWindow;
