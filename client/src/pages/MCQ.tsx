import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/common/Layout";
import MCQForm from "../components/mcq/MCQForm";
import MCQCard from "../components/mcq/MCQCard";
import MCQResult from "../components/mcq/MCQResult";
import Loader from "../components/common/Loader";
import pdfService, { PDFResponse } from "../services/pdfService";
import mcqService, { MCQ } from "../services/mcqService";

const MCQPage = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<MCQ[]>([]);
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

  const handleGenerate = async (numberOfQuestions: number, difficulty: string) => {
    if (!selectedPdfId) {
      toast.error("Upload a PDF first");
      return;
    }

    try {
      setLoading(true);
      setScore(0);
      const response = await mcqService.generateMCQs({
        pdfId: selectedPdfId,
        numberOfQuestions,
        difficulty: difficulty.toLowerCase() as "easy" | "medium" | "hard",
      });
      setQuestions(response.questions);
      setGenerated(true);
      toast.success("MCQs generated");
    } catch {
      toast.error("Failed to generate MCQs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">
          Generate MCQs
        </h1>

        {!generated && (
          <>
            {pdfs.length > 0 && (
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
            )}

            <MCQForm onGenerate={handleGenerate} loading={loading} />
          </>
        )}

        {loading && (
          <div className="flex justify-center">
            <Loader />
          </div>
        )}

        {generated && !loading && (
          <>
            {questions.map((mcq, index) => (
              <MCQCard
                key={mcq.id}
                questionNumber={index + 1}
                question={mcq.question}
                options={mcq.options}
                correctAnswer={mcq.correctAnswer ?? 0}
                onAnswer={(_, correct) => {
                  if (correct) {
                    setScore((prev) => prev + 1);
                  }
                }}
              />
            ))}

            <MCQResult total={questions.length} correct={score} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default MCQPage;
