import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Props {
  data: { day: string; minutes: number; activities: number }[];
}

const WeeklyChart = ({ data }: Props) => {
  const hasMeasuredTime = data.some((entry) => entry.minutes > 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-1">
        This Week
      </h2>

      {/* Only mock tests are timed, so minutes would read as zero for a user
          who studies by chatting. Fall back to activity counts in that case. */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        {hasMeasuredTime
          ? "Measured study minutes (timed mock tests)"
          : "Recorded activities per day"}
      </p>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis allowDecimals={false} />

            <Tooltip />

            <Bar
              dataKey={hasMeasuredTime ? "minutes" : "activities"}
              fill="#16A34A"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
};

export default WeeklyChart;
