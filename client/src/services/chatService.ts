import api from "./api";

export interface ChatRequest {
  message: string;
  pdfId?: string;
  sessionId?: string;
}

export interface ChatResponse {
  answer: string;
  sources?: string[];
  sessionId: string;
  externalSearchUsed?: boolean;
}

export interface ChatMessageRecord {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  documentId: string | null;
  messageCount: number;
  lastMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

class ChatService {
  async sendMessage(data: ChatRequest) {
    const response = await api.post<ChatResponse>("/chat", data);

    return response.data;
  }

  /** Past conversations, newest first. Pass `search` to filter by title or message text. */
  async getSessions(search?: string) {
    const response = await api.get<ChatSessionSummary[]>("/chat/sessions", {
      params: search ? { search } : undefined,
    });

    return response.data;
  }

  async getChatHistory(sessionId: string) {
    const response = await api.get<ChatMessageRecord[]>(
      `/chat/history/${sessionId}`
    );

    return response.data;
  }

  async clearChat(sessionId: string) {
    const response = await api.delete(`/chat/history/${sessionId}`);

    return response.data;
  }
}

export default new ChatService();
