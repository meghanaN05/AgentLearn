import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/common/Layout";
import MCQForm from "../components/mcq/MCQForm";
import MCQCard from "../components/mcq/MCQCard";
import MCQResult from "../components/mcq/MCQResult";
import Loader from "../components/common/Loader";
import pdfService, { PDFResponse } from "../services/pdfService";
import mcqService, { MCQ, SubmitMCQResponse } from "../services/mcqService";

const MCQPage = () => {
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [setId, setSetId] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [graded, setGraded] = useState<SubmitMCQResponse | null>(null);
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  // Set when arriving from a recommendation, e.g. /mcq?topic=Deadlocks
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") ?? "";

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
      setGraded(null);
      setAnswers({});
      const response = await mcqService.generateMCQs({
        pdfId: selectedPdfId,
        numberOfQuestions,
        difficulty: difficulty.toLowerCase() as "easy" | "medium" | "hard",
        topic: topic || undefined,
      });
      setQuestions(response.questions);
      setSetId(response.setId);
      setGenerated(true);
      toast.success("MCQs generated");
    } catch {
      toast.error("Failed to generate MCQs");
    } finally {
      setLoading(false);
    }
  };

  // Grading happens server-side: the answer key is never sent to the browser
  // until the set is submitted.
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await mcqService.submitMCQs({
        setId,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
      });
      setGraded(response);
      toast.success(`Scored ${response.score}%`);
    } catch {
      toast.error("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Generate MCQs
          </h1>
          {topic && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Focused on <span className="font-medium">{topic}</span>
            </p>
          )}
        </div>

        {!generated && (
          <>
            {pdfs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
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
            {questions.map((mcq, index) => {
              const result = graded?.results.find(
                (item) => item.questionId === mcq.id
              );

              return (
                <MCQCard
                  key={mcq.id}
                  questionNumber={index + 1}
                  question={mcq.question}
                  options={mcq.options}
                  selected={answers[mcq.id] ?? null}
                  onSelect={(index) =>
                    setAnswers((prev) => ({ ...prev, [mcq.id]: index }))
                  }
                  revealed={
                    result
                      ? {
                          correctAnswer: result.correctAnswer,
                          isCorrect: result.isCorrect,
                          explanation: result.explanation,
                        }
                      : undefined
                  }
                />
              );
            })}

            {graded ? (
              <MCQResult total={graded.total} correct={graded.correctAnswers} />
            ) : (
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                disabled={submitting || Object.keys(answers).length === 0}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit Answers"}
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MCQPage;
