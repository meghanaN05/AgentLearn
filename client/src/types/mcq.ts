export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: number;
}

export interface GenerateMCQRequest {
  pdfId: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
}

export interface GenerateMCQResponse {
  questions: MCQ[];
}

export interface MCQAnswer {
  questionId: string;
  selectedOption: number;
}

export interface MCQResult {
  score: number;
  total: number;
  correctAnswers: number;
  wrongAnswers: number;
}