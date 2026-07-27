import api from "./api";

export interface AnalyticsResponse {
  totalPDFs: number;
  totalChats: number;
  totalTests: number;
  averageScore: number;
  studyHours: number;

  topicPerformance: {
    topic: string;
    score: number;
  }[];

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