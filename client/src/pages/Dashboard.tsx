import { useEffect, useState } from "react";

import Layout from "../components/common/Layout";
import StatsCard from "../components/dashboard/StatsCard";
import RecentChats from "../components/dashboard/RecentChats";
import RecentPDFs from "../components/dashboard/RecentPDFs";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import ProgressCard from "../components/dashboard/ProgressCard";
import analyticsService from "../services/analyticsService";
import Loader from "../components/common/Loader";

import {
  FileText,
  MessageCircle,
  Brain,
  Trophy,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPDFs: 0,
    totalChats: 0,
    totalTests: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await analyticsService.getAnalytics();
        setStats({
          totalPDFs: data.totalPDFs,
          totalChats: data.totalChats,
          totalTests: data.totalTests,
          averageScore: data.averageScore,
        });
      } catch {
        // Dashboard can render with zeroed stats if backend is unavailable
      } finally {
        setLoading(false);
      }
    };

    loadStats();
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

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatsCard
            title="Uploaded PDFs"
            value={stats.totalPDFs}
            icon={<FileText size={40} />}
          />

          <StatsCard
            title="AI Chats"
            value={stats.totalChats}
            icon={<MessageCircle size={40} />}
          />

          <StatsCard
            title="Mock Tests"
            value={stats.totalTests}
            icon={<Trophy size={40} />}
          />

          <StatsCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon={<Brain size={40} />}
          />
        </div>

        <PerformanceChart />

        <div className="grid lg:grid-cols-3 gap-6">
          <RecentPDFs />
          <RecentChats />
          <ProgressCard
            title="Overall Progress"
            progress={Math.min(100, Math.round(stats.averageScore))}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
