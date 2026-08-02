import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Brain, Clock, Flame, Trophy } from "lucide-react";

import Layout from "../components/common/Layout";
import Loader from "../components/common/Loader";
import AnalyticsCards from "../components/analytics/AnalyticsCards";
import ScoreChart from "../components/analytics/ScoreChart";
import TopicChart from "../components/analytics/TopicChart";
import WeeklyChart from "../components/analytics/WeeklyChart";
import analyticsService, {
  AnalyticsResponse,
} from "../services/analyticsService";

const Analytics = () => {
  const [stats, setStats] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService
      .getAnalytics()
      .then(setStats)
      .catch(() => toast.error("Could not load analytics"))
      .finally(() => setLoading(false));
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

  if (!stats) {
    return (
      <Layout>
        <p className="text-gray-500 dark:text-gray-400 py-20 text-center">
          Analytics are unavailable. Is the backend running?
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          Learning Analytics
        </h1>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          <AnalyticsCards
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={<Trophy size={35} />}
          />

          <AnalyticsCards
            title="Study Time"
            value={`${stats.studyHours} hrs`}
            icon={<Clock size={35} />}
            color="text-green-600"
          />

          <AnalyticsCards
            title="Learning Streak"
            value={`${stats.learningStreak} day${
              stats.learningStreak === 1 ? "" : "s"
            }`}
            icon={<Flame size={35} />}
            color="text-orange-500"
          />

          <AnalyticsCards
            title="Questions Asked"
            value={stats.questionsAsked}
            icon={<Brain size={35} />}
            color="text-purple-600"
          />

        </div>

        <div className="grid xl:grid-cols-2 gap-6">

          <ScoreChart data={stats.scoreHistory} />

          <TopicChart data={stats.topicPerformance} />

        </div>

        <WeeklyChart data={stats.dailyActivity} />

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Weak Topics</h2>
            {stats.weakTopics.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No weak topics identified yet.
              </p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {stats.weakTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Strong Topics</h2>
            {stats.strongTopics.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No strong topics identified yet.
              </p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {stats.strongTopics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            )}
          </div>

        </div>

      </div>
    </Layout>
  );
};

export default Analytics;
