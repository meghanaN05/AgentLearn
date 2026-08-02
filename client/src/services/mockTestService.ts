import api from "./api";

export interface GenerateMockTestRequest {
  pdfId: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
  topic?: string;
  timeLimitMinutes?: number;
}

export interface MockQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface MockTestResponse {
  testId: string;
  questions: MockQuestion[];
}

export interface SubmitMockTestRequest {
  testId: string;
  answers: {
    questionId: string;
    selectedOption: number;
  }[];
  timeTakenSeconds: number;
}

export interface SubmitMockTestResponse {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
}

export interface MockTestAttempt {
  id: string;
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeTakenSeconds: number;
  weakTopics: string[];
  strongTopics: string[];
  submittedAt: string;
}

class MockTestService {
  async generateMockTest(data: GenerateMockTestRequest) {
    const response = await api.post<MockTestResponse>("/mocktest", data);

    return response.data;
  }

  async submitMockTest(data: SubmitMockTestRequest) {
    const response = await api.post<SubmitMockTestResponse>(
      "/mocktest/submit",
      data
    );

    return response.data;
  }

  async getMockTest(testId: string) {
    const response = await api.get<MockTestResponse>(`/mocktest/${testId}`);

    return response.data;
  }

  /** Mock test history, newest first. */
  async getAttempts(limit = 20) {
    const response = await api.get<MockTestAttempt[]>("/mocktest/attempts", {
      params: { limit },
    });

    return response.data;
  }
}

export default new MockTestService();
