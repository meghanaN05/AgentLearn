import { useEffect, useState } from "react";

import pdfService, { PDFResponse } from "../../services/pdfService";
import Loader from "../common/Loader";

const RecentPDFs = () => {
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPDFs = async () => {
      try {
        const data = await pdfService.getPDFs();
        setPdfs(data.slice(0, 5));
      } catch {
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };

    loadPDFs();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">
        Recent PDFs
      </h2>

      {loading ? (
        <Loader />
      ) : pdfs.length === 0 ? (
        <p className="text-gray-500 text-sm">No PDFs uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {pdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="border rounded-lg p-3 hover:bg-gray-100 cursor-pointer"
            >
              {pdf.filename}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentPDFs;
