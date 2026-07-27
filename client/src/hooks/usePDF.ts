import { useEffect, useState } from "react";
import pdfService, {
  PDFResponse,
} from "../services/pdfService";

const usePDF = () => {
  const [pdfs, setPDFs] = useState<PDFResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPDFs = async () => {
    setLoading(true);

    try {
      const data = await pdfService.getPDFs();
      setPDFs(data);
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadPDF = async (file: File) => {
    setLoading(true);

    try {
      await pdfService.uploadPDF(file);
      await fetchPDFs();
    } catch (error) {
      console.error("Failed to upload PDF:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePDF = async (id: string) => {
    setLoading(true);

    try {
      await pdfService.deletePDF(id);

      setPDFs((prev) =>
        prev.filter((pdf) => pdf.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete PDF:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (id: string) => {
    try {
      const blob = await pdfService.downloadPDF(id);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "document.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  return {
    pdfs,
    loading,

    fetchPDFs,
    uploadPDF,
    deletePDF,
    downloadPDF,
  };
};

export default usePDF;