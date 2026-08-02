import {
  CheckCircle,
  XCircle,
  Trophy,
} from "lucide-react";

interface MCQResultProps {
  total: number;
  correct: number;
}

const MCQResult = ({
  total,
  correct,
}: MCQResultProps) => {
  const incorrect = total - correct;

  const percentage = Math.round(
    (correct / total) * 100
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">

      <Trophy
        className="mx-auto text-yellow-500 mb-4"
        size={60}
      />

      <h2 className="text-3xl font-bold mb-6">
        Quiz Completed
      </h2>

      <div className="grid grid-cols-3 gap-6">

        <div>

          <CheckCircle
            className="mx-auto text-green-600"
            size={35}
          />

          <p className="mt-2 text-lg font-semibold">
            {correct}
          </p>

          <p className="text-gray-500 dark:text-gray-400">
            Correct
          </p>

        </div>

        <div>

          <XCircle
            className="mx-auto text-red-600"
            size={35}
          />

          <p className="mt-2 text-lg font-semibold">
            {incorrect}
          </p>

          <p className="text-gray-500 dark:text-gray-400">
            Incorrect
          </p>

        </div>

        <div>

          <h3 className="text-4xl font-bold text-blue-600">
            {percentage}%
          </h3>

          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Score
          </p>

        </div>

      </div>

    </div>
  );
};

export default MCQResult;