export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  pdfId?: string;
  sessionId?: string;
}

export interface ChatResponse {
  answer: string;
  sessionId: string;
  sources?: string[];
}