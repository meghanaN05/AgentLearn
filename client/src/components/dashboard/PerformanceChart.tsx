import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  YAxis,
} from "recharts";

import analyticsService from "../../services/analyticsService";

const PerformanceChart = () => {
  const [data, setData] = useState<{ week: string; score: number }[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    analyticsService
      .getAnalytics()
      .then((analytics) => setData(analytics.weeklyProgress))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  const hasScores = data.some((entry) => entry.score > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-5">
        Performance Trend
      </h2>

      {loaded && !hasScores ? (
        <p className="text-gray-500 dark:text-gray-400 py-16 text-center">
          Take a mock test to start tracking your progress.
        </p>
      ) : (
        <div className="h-80">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="week" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563EB"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
};

export default PerformanceChart;
