import api from "./api";

export interface SummaryRequest {
  pdfId: string;
  summaryType: "short" | "medium" | "detailed";
}

export interface SummaryResponse {
  summary: string;
}

class SummaryService {
  async generateSummary(data: SummaryRequest) {
    const response = await api.post<SummaryResponse>(
      "/summary",
      data
    );

    return response.data;
  }

  async regenerateSummary(data: SummaryRequest) {
    const response = await api.post<SummaryResponse>(
      "/summary/regenerate",
      data
    );

    return response.data;
  }
}

export default new SummaryService();