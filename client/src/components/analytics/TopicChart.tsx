import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Props {
  data: { topic: string; score: number; attempted: number }[];
}

/** Green at or above 75%, amber to 60%, red below — the same thresholds the
 *  backend uses to classify strong and weak topics. */
const barColor = (score: number) => {
  if (score >= 75) return "#16A34A";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
};

const TopicChart = ({ data }: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-5">
        Topic-wise Accuracy
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 py-16 text-center">
          Take a mock test to see accuracy per topic.
        </p>
      ) : (
        <div className="h-80">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart data={data} layout="vertical" margin={{ left: 24 }}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis type="number" domain={[0, 100]} unit="%" />

              <YAxis type="category" dataKey="topic" width={110} />

              <Tooltip formatter={(value) => [`${value}%`, "Accuracy"]} />

              <Bar dataKey="score">
                {data.map((item) => (
                  <Cell key={item.topic} fill={barColor(item.score)} />
                ))}
              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
};

export default TopicChart;
