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
}

class ChatService {
  async sendMessage(data: ChatRequest) {
    const response = await api.post<ChatResponse>(
      "/chat",
      data
    );

    return response.data;
  }

  async getChatHistory(sessionId: string) {
    const response = await api.get(
      `/chat/history/${sessionId}`
    );

    return response.data;
  }

  async clearChat(sessionId: string) {
    const response = await api.delete(
      `/chat/history/${sessionId}`
    );

    return response.data;
  }
}

export default new ChatService();