import Layout from "../components/common/Layout";
import ResultCard from "../components/mocktest/ResultCard";
import WeakTopics from "../components/recommendation/WeakTopics";
import RecommendationCard from "../components/recommendation/RecommendationCard";
import Button from "../components/common/Button";
import { Link } from "react-router-dom";

const Result = () => {
  const weakTopics = [
    {
      topic: "Deadlocks",
      score: 42,
    },
    {
      topic: "Normalization",
      score: 55,
    },
    {
      topic: "TCP Congestion",
      score: 61,
    },
  ];

  return (
    <Layout>

      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-4xl font-bold">
          Test Result
        </h1>

        {/* Score */}

        <ResultCard
          total={20}
          correct={16}
          timeTaken={28}
        />

        {/* Weak Topics */}

        <WeakTopics
          topics={weakTopics}
        />

        {/* AI Recommendation */}

        <RecommendationCard
          title="Focus on Deadlocks"
          description="Your performance indicates that Deadlocks and Process Synchronization need more revision. Review the summary and solve additional MCQs."
          category="Operating Systems"
          priority="High"
        />

        {/* Buttons */}

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