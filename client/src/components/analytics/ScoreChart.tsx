import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { label: string; score: number }[];
}

const ScoreChart = ({ data }: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-5">
        Test Scores
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-16 text-center">
          Take a mock test to see your score trend.
        </p>
      ) : (
        <div className="h-80">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="label" />

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

export default ScoreChart;
