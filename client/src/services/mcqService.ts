import api from "./api";

export interface GenerateMCQRequest {
  pdfId: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
}

export interface MCQResponse {
  questions: MCQ[];
}

export interface SubmitMCQRequest {
  pdfId: string;
  answers: {
    questionId: string;
    selectedOption: number;
  }[];
}

export interface SubmitMCQResponse {
  score: number;
  total: number;
  correctAnswers: number;
  wrongAnswers: number;
}

class MCQService {
  async generateMCQs(data: GenerateMCQRequest) {
    const response = await api.post<MCQResponse>(
      "/mcq",
      data
    );

    return response.data;
  }

  async submitMCQs(data: SubmitMCQRequest) {
    const response = await api.post<SubmitMCQResponse>(
      "/mcq/submit",
      data
    );

    return response.data;
  }
}

export default new MCQService();