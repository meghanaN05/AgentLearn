import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/common/Layout";
import SummaryOptions from "../components/summary/SummaryOptions";
import SummaryViewer from "../components/summary/SummaryViewer";
import SummaryCard from "../components/summary/SummaryCard";
import Loader from "../components/common/Loader";
import pdfService, { PDFResponse } from "../services/pdfService";
import summaryService from "../services/summaryService";

const Summary = () => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");

  useEffect(() => {
    const loadPDFs = async () => {
      try {
        const data = await pdfService.getPDFs();
        setPdfs(data);
        if (data.length > 0) {
          setSelectedPdfId(data[0].id);
        }
      } catch {
        toast.error("Failed to load PDFs");
      }
    };

    loadPDFs();
  }, []);

  const handleGenerate = async (_type: string, length: string) => {
    if (!selectedPdfId) {
      toast.error("Upload a PDF first");
      return;
    }

    const summaryType =
      length === "long" ? "detailed" : length === "short" ? "short" : "medium";

    try {
      setLoading(true);
      const response = await summaryService.generateSummary({
        pdfId: selectedPdfId,
        summaryType: summaryType as "short" | "medium" | "detailed",
      });
      setSummary(response.summary);
      toast.success("Summary generated");
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "summary.md";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">
          AI Summary
        </h1>

        {pdfs.length === 0 ? (
          <p className="text-gray-500">
            Upload a PDF from the Upload page to generate summaries.
          </p>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block mb-2 font-medium">
                Select Document
              </label>
              <select
                className="w-full border rounded-lg p-3"
                value={selectedPdfId}
                onChange={(e) => setSelectedPdfId(e.target.value)}
              >
                {pdfs.map((pdf) => (
                  <option key={pdf.id} value={pdf.id}>
                    {pdf.filename}
                  </option>
                ))}
              </select>
            </div>

            <SummaryOptions onGenerate={handleGenerate} loading={loading} />
          </>
        )}

        {loading && (
          <div className="flex justify-center">
            <Loader />
          </div>
        )}

        {summary && !loading && (
          <>
            <SummaryViewer summary={summary} />
            <SummaryCard
              title="Latest Summary"
              createdAt={new Date().toLocaleString()}
              words={summary.trim().split(/\s+/).length}
              onDownload={handleDownload}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Summary;
