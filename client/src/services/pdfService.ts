import api from "./api";

export interface PDFResponse {
  id: string;
  filename: string;
  pages: number;
  size: number;
  uploaded_at: string;
  processing_status?: string;
}

class PDFService {
  async uploadPDF(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
      "/pdf/upload",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    return response.data;
  }

  async getPDFs() {
    const response = await api.get<PDFResponse[]>(
      "/pdf"
    );

    return response.data;
  }

  async getPDF(id: string) {
    const response = await api.get(
      `/pdf/${id}`
    );

    return response.data;
  }

  async deletePDF(id: string) {
    const response = await api.delete(
      `/pdf/${id}`
    );

    return response.data;
  }

  async downloadPDF(id: string) {
    const response = await api.get(
      `/pdf/${id}/download`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  }
}

export default new PDFService();