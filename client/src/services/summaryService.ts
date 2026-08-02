import api from "./api";

export interface SummaryRequest {
  pdfId: string;
  summaryType: "short" | "medium" | "detailed";
  /** Omit to summarise the whole document; the server then samples chunks
   *  across it rather than similarity-matching a vague instruction. */
  topic?: string;
}

export interface SummaryResponse {
  summary: string;
  id?: string | null;
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