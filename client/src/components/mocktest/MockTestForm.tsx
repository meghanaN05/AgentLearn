import { useState } from "react";
import Button from "../common/Button";

interface MockTestFormProps {
  onStart: (
    questions: number,
    duration: number,
    difficulty: string
  ) => void;
  loading?: boolean;
}

const MockTestForm = ({
  onStart,
  loading = false,
}: MockTestFormProps) => {
  const [questions, setQuestions] = useState(20);
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState("Medium");

  const handleStart = () => {
    onStart(questions, duration, difficulty);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-5">

      <h2 className="text-2xl font-bold">
        Configure Mock Test
      </h2>

      <div>
        <label className="block mb-2 font-medium">
          Number of Questions
        </label>

        <input
          type="number"
          min={5}
          max={100}
          value={questions}
          onChange={(e) =>
            setQuestions(Number(e.target.value))
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Duration (Minutes)
        </label>

        <input
          type="number"
          min={5}
          value={duration}
          onChange={(e) =>
            setDuration(Number(e.target.value))
          }
          className="w-full border rounded-lg p-3"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Difficulty
        </label>

        <select
          value={difficulty}
          onChange={(e) =>
            setDifficulty(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <Button
        className="w-full"
        onClick={handleStart}
        disabled={loading}
      >
        {loading ? "Preparing..." : "Start Mock Test"}
      </Button>

    </div>
  );
};

export default MockTestForm;