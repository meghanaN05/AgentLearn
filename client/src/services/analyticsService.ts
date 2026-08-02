import api from "./api";

export interface AnalyticsResponse {
  totalPDFs: number;
  totalChats: number;
  totalTests: number;
  questionsAsked: number;
  summariesGenerated: number;
  mcqsGenerated: number;
  averageScore: number;
  /** Measured mock-test time only. Reading and chat time are not instrumented. */
  studyHours: number;
  activeDays: number;
  learningStreak: number;

  topicPerformance: {
    topic: string;
    score: number;
    attempted: number;
  }[];

  weakTopics: string[];
  strongTopics: string[];

  weeklyProgress: {
    week: string;
    score: number;
  }[];
}

class AnalyticsService {
  async getAnalytics() {
    const response = await api.get<AnalyticsResponse>(
      "/analytics"
    );

    return response.data;
  }

  async getTopicPerformance() {
    const response = await api.get(
      "/analytics/topics"
    );

    return response.data;
  }

  async getWeeklyProgress() {
    const response = await api.get(
      "/analytics/weekly"
    );

    return response.data;
  }
}

export default new AnalyticsService();