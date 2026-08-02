import { ReactNode } from "react";

interface Props {
  title: string;
  value: number | string;
  icon: ReactNode;
}

const StatsCard = ({
  title,
  value,
  icon,
}: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex justify-between items-center">

      <div>

        <h3 className="text-gray-500 dark:text-gray-400">
          {title}
        </h3>

        <p className="text-3xl font-bold mt-2">
          {value}
        </p>

      </div>

      <div className="text-blue-600">
        {icon}
      </div>

    </div>
  );
};

export default StatsCard;