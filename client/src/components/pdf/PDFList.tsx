import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import pdfService, { PDFResponse } from "../../services/pdfService";
import { formatFileSize } from "../../utils/helpers";
import Loader from "../common/Loader";
import PDFCard from "./PDFCard";

const PDFList = () => {
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPDFs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pdfService.getPDFs();
      setPdfs(data);
    } catch {
      toast.error("Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPDFs();
  }, [loadPDFs]);

  const handleDelete = async (id: string) => {
    try {
      await pdfService.deletePDF(id);
      toast.success("PDF deleted");
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    } catch {
      toast.error("Failed to delete PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (pdfs.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No PDFs uploaded yet. Drop files above to get started.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {pdfs.map((pdf) => (
        <PDFCard
          key={pdf.id}
          id={pdf.id}
          fileName={pdf.filename}
          pages={pdf.pages}
          size={formatFileSize(pdf.size)}
          status={pdf.processing_status}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default PDFList;
