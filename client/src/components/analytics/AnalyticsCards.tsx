import { ReactNode } from "react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

const AnalyticsCards = ({
  title,
  value,
  icon,
  color = "text-blue-600",
}: AnalyticsCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div className={`${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCards;