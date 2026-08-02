import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../components/common/Layout";
import Loader from "../components/common/Loader";
import ResultCard from "../components/mocktest/ResultCard";
import WeakTopics from "../components/recommendation/WeakTopics";
import Button from "../components/common/Button";
import analyticsService from "../services/analyticsService";
import mockTestService, { MockTestAttempt } from "../services/mockTestService";

const Result = () => {
  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null);
  const [topicScores, setTopicScores] = useState<
    { topic: string; score: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [attempts, analytics] = await Promise.all([
          mockTestService.getAttempts(1),
          analyticsService.getAnalytics(),
        ]);

        setAttempt(attempts[0] ?? null);

        // Scope the breakdown to the topics this attempt actually flagged.
        const flagged = new Set(attempts[0]?.weakTopics ?? []);
        setTopicScores(
          analytics.topicPerformance
            .filter((item) => flagged.has(item.topic))
            .map((item) => ({ topic: item.topic, score: item.score }))
        );
      } catch {
        toast.error("Could not load your latest result");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (!attempt) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto space-y-6 py-20 text-center">
          <h1 className="text-3xl font-bold">No results yet</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Take a mock test and your score breakdown will appear here.
          </p>
          <Link to="/mocktest">
            <Button>Start a mock test</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="max-w-6xl mx-auto space-y-8">

        <div>
          <h1 className="text-4xl font-bold">
            Test Result
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Submitted {new Date(attempt.submittedAt).toLocaleString()}
          </p>
        </div>

        <ResultCard
          total={attempt.totalQuestions}
          correct={attempt.correctAnswers}
          timeTaken={Math.round(attempt.timeTakenSeconds / 60)}
        />

        {topicScores.length > 0 && <WeakTopics topics={topicScores} />}

        {attempt.strongTopics.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Strong Topics</h2>
            <div className="flex flex-wrap gap-2">
              {attempt.strongTopics.map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">

          <Link to="/mocktest">
            <Button>
              Retake Test
            </Button>
          </Link>

          <Link to="/recommendations">
            <Button variant="outline">
              View Study Plan
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button variant="secondary">
              Dashboard
            </Button>
          </Link>

        </div>

      </div>

    </Layout>
  );
};

export default Result;
