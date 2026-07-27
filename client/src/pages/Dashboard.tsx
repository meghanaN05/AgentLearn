import Layout from "../components/common/Layout";
import StatsCard from "../components/dashboard/StatsCard";
import RecentChats from "../components/dashboard/RecentChats";
import RecentPDFs from "../components/dashboard/RecentPDFs";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import ProgressCard from "../components/dashboard/ProgressCard";

import {
  FileText,
  MessageCircle,
  Brain,
  Trophy,
} from "lucide-react";

const Dashboard = () => {
  return (
    <Layout>

      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        {/* Stats */}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

          <StatsCard
            title="Uploaded PDFs"
            value={18}
            icon={<FileText size={40} />}
          />

          <StatsCard
            title="AI Chats"
            value={52}
            icon={<MessageCircle size={40} />}
          />

          <StatsCard
            title="Generated MCQs"
            value={180}
            icon={<Brain size={40} />}
          />

          <StatsCard
            title="Mock Tests"
            value={12}
            icon={<Trophy size={40} />}
          />

        </div>

        {/* Charts */}

        <PerformanceChart />

        {/* Bottom */}

        <div className="grid lg:grid-cols-3 gap-6">

          <RecentPDFs />

          <RecentChats />

          <ProgressCard
            title="Overall Progress"
            progress={82}
          />

        </div>

      </div>

    </Layout>
  );
};

export default Dashboard;