import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  YAxis,
} from "recharts";

const data = [
  { week: "Week 1", score: 65 },
  { week: "Week 2", score: 72 },
  { week: "Week 3", score: 81 },
  { week: "Week 4", score: 89 },
  { week: "Week 5", score: 92 },
];

const PerformanceChart = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-5">
        Performance Trend
      </h2>

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

    </div>
  );
};

export default PerformanceChart;