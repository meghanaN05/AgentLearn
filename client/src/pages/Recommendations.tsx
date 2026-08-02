import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";

import Layout from "../components/common/Layout";
import Loader from "../components/common/Loader";
import RecommendationCard from "../components/recommendation/RecommendationCard";
import StudyPlan from "../components/recommendation/StudyPlan";
import WeakTopics from "../components/recommendation/WeakTopics";
import analyticsService from "../services/analyticsService";
import recommendationService, {
  RecommendationResponse,
} from "../services/recommendationService";

type Priority = "High" | "Medium" | "Low";

const asPriority = (value: string): Priority =>
  value === "High" || value === "Low" ? value : "Medium";

const Recommendations = () => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [weakTopics, setWeakTopics] = useState<
    { topic: string; score: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeakTopics = useCallback(async () => {
    try {
      const analytics = await analyticsService.getAnalytics();
      // Show measured accuracy per weak topic rather than the bare topic name.
      setWeakTopics(
        analytics.topicPerformance
          .filter((item) => item.score < 60)
          .map((item) => ({ topic: item.topic, score: item.score }))
      );
    } catch {
      // Non-fatal: the recommendations themselves still render.
    }
  }, []);

  useEffect(() => {
    Promise.all([recommendationService.getRecommendations(), loadWeakTopics()])
      .then(([recommendations]) => setData(recommendations))
      .catch(() => toast.error("Could not load recommendations"))
      .finally(() => setLoading(false));
  }, [loadWeakTopics]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const refreshed = await recommendationService.refreshRecommendations();
      setData(refreshed);
      await loadWeakTopics();
      toast.success("Recommendations regenerated");
    } catch (error: unknown) {
      const detail =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { detail?: string } } }).response
          ?.data?.detail === "string"
          ? (error as { response: { data: { detail: string } } }).response.data
              .detail
          : "Could not regenerate recommendations";

      toast.error(detail);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      </Layout>
    );
  }

  const recommendations = data?.recommendations ?? [];
  const studyPlan = data?.studyPlan ?? [];

  return (
    <Layout>

      <div className="space-y-8">

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            AI Recommendations
          </h1>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            <RefreshCw size={18} />
            {refreshing ? "Generating..." : "Regenerate"}
          </button>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No recommendations yet. Take a mock test, or hit Regenerate to
            build a study plan from your current performance.
          </p>
        ) : (
          recommendations.map((item) => (
            <RecommendationCard
              key={item.id}
              title={item.title}
              description={item.description}
              category={item.topic}
              priority={asPriority(item.priority)}
            />
          ))
        )}

        {studyPlan.length > 0 && <StudyPlan tasks={studyPlan} />}

        {weakTopics.length > 0 && <WeakTopics topics={weakTopics} />}

      </div>

    </Layout>
  );
};

export default Recommendations;
