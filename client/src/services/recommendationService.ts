import api from "./api";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  topic: string;
}

export interface StudyPlanTask {
  id: string;
  topic: string;
  duration: string;
  completed: boolean;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  studyPlan: StudyPlanTask[];
}

class RecommendationService {
  async getRecommendations() {
    const response =
      await api.get<RecommendationResponse>(
        "/recommendations"
      );

    return response.data;
  }

  async refreshRecommendations() {
    const response =
      await api.post<RecommendationResponse>(
        "/recommendations/refresh"
      );

    return response.data;
  }
}

export default new RecommendationService();