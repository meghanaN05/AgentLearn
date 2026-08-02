import api from "./api";

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

export interface PDFResponse {
  id: string;
  filename: string;
  pages: number;
  size: number;
  uploaded_at: string;
  processing_status?: ProcessingStatus;
  processing_error?: string | null;
}

class PDFService {
  /**
   * Uploads a PDF. The server stores it and returns immediately with
   * `processing_status: "processing"` — text extraction and embedding happen in
   * the background. Use `waitForProcessing` to follow it to completion.
   */
  async uploadPDF(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post<PDFResponse>("/pdf/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  async waitForProcessing(
    id: string,
    { intervalMs = 1500, timeoutMs = 180000 } = {}
  ): Promise<PDFResponse> {
    const deadline = Date.now() + timeoutMs;

    for (;;) {
      const pdf = await this.getPDF(id);

      if (
        pdf.processing_status === "completed" ||
        pdf.processing_status === "failed"
      ) {
        return pdf;
      }

      if (Date.now() > deadline) {
        throw new Error("Timed out waiting for the document to be processed");
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  async getPDFs(search?: string) {
    const response = await api.get<PDFResponse[]>("/pdf", {
      params: search ? { search } : undefined,
    });

    return response.data;
  }

  async getPDF(id: string) {
    const response = await api.get<PDFResponse>(`/pdf/${id}`);

    return response.data;
  }

  async renamePDF(id: string, filename: string) {
    const response = await api.patch<PDFResponse>(`/pdf/${id}`, { filename });

    return response.data;
  }

  async deletePDF(id: string) {
    const response = await api.delete(`/pdf/${id}`);

    return response.data;
  }

  async downloadPDF(id: string) {
    const response = await api.get(`/pdf/${id}/download`, {
      responseType: "blob",
    });

    return response.data;
  }
}

export default new PDFService();
