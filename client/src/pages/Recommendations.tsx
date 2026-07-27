import Layout from "../components/common/Layout";
import RecommendationCard from "../components/recommendation/RecommendationCard";
import StudyPlan from "../components/recommendation/StudyPlan";
import WeakTopics from "../components/recommendation/WeakTopics";

const Recommendations = () => {

  const tasks = [
    {
      id: 1,
      topic: "Operating Systems",
      duration: "2 Hours",
      completed: true,
    },
    {
      id: 2,
      topic: "Computer Networks",
      duration: "1.5 Hours",
      completed: false,
    },
    {
      id: 3,
      topic: "DBMS",
      duration: "2 Hours",
      completed: false,
    },
  ];

  const weakTopics = [
    { topic: "Deadlocks", score: 42 },
    { topic: "TCP Congestion", score: 53 },
    { topic: "Normalization", score: 60 },
  ];

  return (
    <Layout>

      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          AI Recommendations
        </h1>

        <RecommendationCard
          title="Revise Deadlocks"
          description="Your recent quiz performance indicates difficulty in deadlock handling."
          category="Operating Systems"
          priority="High"
        />

        <StudyPlan tasks={tasks} />

        <WeakTopics topics={weakTopics} />

      </div>

    </Layout>
  );
};

export default Recommendations;