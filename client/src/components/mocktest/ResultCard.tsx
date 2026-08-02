import {
  Trophy,
  Clock,
  Target,
  CheckCircle,
} from "lucide-react";

interface ResultCardProps {
  total: number;
  correct: number;
  timeTaken: number;
}

const ResultCard = ({
  total,
  correct,
  timeTaken,
}: ResultCardProps) => {

  const percentage = Math.round(
    (correct / total) * 100
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">

      <Trophy
        size={70}
        className="mx-auto text-yellow-500 mb-6"
      />

      <h2 className="text-3xl font-bold mb-8">
        Mock Test Result
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <div>

          <CheckCircle
            size={35}
            className="mx-auto text-green-600"
          />

          <p className="mt-3 text-2xl font-bold">
            {correct}/{total}
          </p>

          <p className="text-gray-500 dark:text-gray-400">
            Correct Answers
          </p>

        </div>

        <div>

          <Clock
            size={35}
            className="mx-auto text-blue-600"
          />

          <p className="mt-3 text-2xl font-bold">
            {timeTaken} min
          </p>

          <p className="text-gray-500 dark:text-gray-400">
            Time Taken
          </p>

        </div>

        <div>

          <Target
            size={35}
            className="mx-auto text-purple-600"
          />

          <p className="mt-3 text-2xl font-bold">
            {percentage}%
          </p>

          <p className="text-gray-500 dark:text-gray-400">
            Accuracy
          </p>

        </div>

      </div>

    </div>
  );
};

export default ResultCard;