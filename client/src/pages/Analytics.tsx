import Layout from "../components/common/Layout";
import AnalyticsCards from "../components/analytics/AnalyticsCards";
import ScoreChart from "../components/analytics/ScoreChart";
import TopicChart from "../components/analytics/TopicChart";
import WeeklyChart from "../components/analytics/WeeklyChart";

import {
  Trophy,
  BookOpen,
  Brain,
  Clock,
} from "lucide-react";

const Analytics = () => {
  return (
    <Layout>
      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          Learning Analytics
        </h1>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          <AnalyticsCards
            title="Average Score"
            value="89%"
            icon={<Trophy size={35} />}
          />

          <AnalyticsCards
            title="Study Hours"
            value="125 hrs"
            icon={<Clock size={35} />}
            color="text-green-600"
          />

          <AnalyticsCards
            title="Topics Learned"
            value={18}
            icon={<BookOpen size={35} />}
            color="text-blue-600"
          />

          <AnalyticsCards
            title="AI Questions"
            value={432}
            icon={<Brain size={35} />}
            color="text-purple-600"
          />

        </div>

        <div className="grid xl:grid-cols-2 gap-6">

          <ScoreChart />

          <TopicChart />

        </div>

        <WeeklyChart />

      </div>
    </Layout>
  );
};

export default Analytics;