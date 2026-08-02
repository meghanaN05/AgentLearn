import { ReactNode } from "react";
import { motion } from "framer-motion";

import CountUp from "../motion/CountUp";
import { interactive } from "../../lib/motion";

interface Props {
  title: string;
  value: number | string;
  icon: ReactNode;
  /** Set when `value` is numeric so the figure counts up on first view. */
  numericValue?: number;
  suffix?: string;
  decimals?: number;
}

const StatsCard = ({
  title,
  value,
  icon,
  numericValue,
  suffix = "",
  decimals = 0,
}: Props) => {
  return (
    <motion.div
      {...interactive}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex justify-between items-center"
    >

      <div>

        <h3 className="text-sm text-gray-500 dark:text-gray-400">
          {title}
        </h3>

        <p className="text-3xl font-semibold mt-2 tabular-nums">
          {numericValue === undefined ? (
            value
          ) : (
            <CountUp value={numericValue} suffix={suffix} decimals={decimals} />
          )}
        </p>

      </div>

      <div className="text-blue-600">
        {icon}
      </div>

    </motion.div>
  );
};

export default StatsCard;
