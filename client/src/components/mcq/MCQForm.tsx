import { useState } from "react";
import Button from "../common/Button";

interface MCQFormProps {
  onGenerate: (
    numberOfQuestions: number,
    difficulty: string
  ) => void;
  loading?: boolean;
}

const MCQForm = ({
  onGenerate,
  loading = false,
}: MCQFormProps) => {
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");

  const handleSubmit = () => {
    onGenerate(count, difficulty);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-5">

      <h2 className="text-2xl font-bold">
        Generate MCQs
      </h2>

      <div>

        <label className="block mb-2 font-medium">
          Number of Questions
        </label>

        <input
          type="number"
          min={5}
          max={100}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full border rounded-lg p-3"
        />

      </div>

      <div>

        <label className="block mb-2 font-medium">
          Difficulty
        </label>

        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full border rounded-lg p-3"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>

      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate MCQs"}
      </Button>

    </div>
  );
};

export default MCQForm;