export interface Document {
  id: string;
  filename: string;
  pages: number;
  size: number;
  uploadedAt: string;
  status?: "processing" | "ready" | "failed";
}

export interface UploadResponse {
  id: string;
  filename: string;
  message: string;
}