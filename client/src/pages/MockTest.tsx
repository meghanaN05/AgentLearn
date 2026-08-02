import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/common/Layout";
import MockTestForm from "../components/mocktest/MockTestForm";
import QuestionCard from "../components/mocktest/QuestionCard";
import Timer from "../components/mocktest/Timer";
import ResultCard from "../components/mocktest/ResultCard";
import Loader from "../components/common/Loader";
import pdfService, { PDFResponse } from "../services/pdfService";
import mockTestService, { MockQuestion } from "../services/mockTestService";

const MockTest = () => {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [testId, setTestId] = useState("");
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [duration, setDuration] = useState(30);
  const [startedAt, setStartedAt] = useState(0);
  const [result, setResult] = useState({
    total: 0,
    correct: 0,
    timeTaken: 0,
  });

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

  const handleStart = async (
    questionCount: number,
    testDuration: number,
    difficulty: string
  ) => {
    if (!selectedPdfId) {
      toast.error("Upload a PDF first");
      return;
    }

    try {
      setLoading(true);
      const response = await mockTestService.generateMockTest({
        pdfId: selectedPdfId,
        numberOfQuestions: questionCount,
        difficulty: difficulty.toLowerCase() as "easy" | "medium" | "hard",
      });
      setTestId(response.testId);
      setQuestions(response.questions);
      setDuration(testDuration);
      setStartedAt(Date.now());
      setStarted(true);
      setCurrentIndex(0);
      setAnswers({});
      toast.success("Mock test ready");
    } catch {
      toast.error("Failed to generate mock test");
    } finally {
      setLoading(false);
    }
  };

  const submitTest = async () => {
    if (!testId) {
      return;
    }

    // Measured from the real clock so a manual submit records actual elapsed
    // time rather than the allotted duration (or zero).
    const elapsedSeconds = startedAt
      ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
      : 0;

    try {
      setSubmitting(true);
      const response = await mockTestService.submitMockTest({
        testId,
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })),
        timeTakenSeconds: elapsedSeconds,
      });

      setResult({
        total: response.totalQuestions,
        correct: response.correctAnswers,
        timeTaken: Math.round(elapsedSeconds / 60),
      });
      setFinished(true);
    } catch {
      toast.error("Failed to submit mock test");
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">
          Mock Test
        </h1>

        {!started && (
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

            <MockTestForm onStart={handleStart} loading={loading} />
          </>
        )}

        {loading && (
          <div className="flex justify-center">
            <Loader />
          </div>
        )}

        {started && !finished && currentQuestion && (
          <>
            <Timer
              minutes={duration}
              onComplete={() => submitTest()}
            />

            <QuestionCard
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              question={currentQuestion.question}
              options={currentQuestion.options}
              selected={answers[currentQuestion.id] ?? null}
              onSelect={(selected) => {
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: selected,
                }));
              }}
            />

            <div className="flex gap-4">
              <button
                type="button"
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                  disabled={submitting}
                  onClick={() => submitTest()}
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              )}
            </div>
          </>
        )}

        {finished && (
          <ResultCard
            total={result.total}
            correct={result.correct}
            timeTaken={result.timeTaken}
          />
        )}
      </div>
    </Layout>
  );
};

export default MockTest;
