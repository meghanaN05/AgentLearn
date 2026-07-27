export interface MockQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface MockTest {
  testId: string;
  questions: MockQuestion[];
}

export interface MockTestAnswer {
  questionId: string;
  selectedOption: number;
}

export interface MockTestResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  weakTopics: string[];
}