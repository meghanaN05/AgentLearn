import api from "./api";

export interface GenerateMCQRequest {
  pdfId: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
  topic?: string;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  /** Withheld while the set is being taken; revealed in the graded results. */
  correctAnswer?: number;
  explanation?: string;
}

export interface MCQResponse {
  setId: string;
  questions: MCQ[];
}

export interface SubmitMCQRequest {
  /** Pins grading to the exact set that was served. */
  setId: string;
  answers: {
    questionId: string;
    selectedOption: number;
  }[];
}

export interface MCQGradedItem {
  questionId: string;
  question: string;
  selectedOption: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface SubmitMCQResponse {
  score: number;
  total: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  results: MCQGradedItem[];
}

class MCQService {
  async generateMCQs(data: GenerateMCQRequest) {
    const response = await api.post<MCQResponse>("/mcq", data);

    return response.data;
  }

  async submitMCQs(data: SubmitMCQRequest) {
    const response = await api.post<SubmitMCQResponse>("/mcq/submit", data);

    return response.data;
  }
}

export default new MCQService();
