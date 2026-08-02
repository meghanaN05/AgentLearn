import { useState } from "react";
import Button from "../common/Button";

interface SummaryOptionsProps {
  onGenerate: (type: string, length: string) => void;
  loading?: boolean;
}

const SummaryOptions = ({
  onGenerate,
  loading = false,
}: SummaryOptionsProps) => {
  const [type, setType] = useState("paragraph");
  const [length, setLength] = useState("medium");

  const handleGenerate = () => {
    onGenerate(type, length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-6">

      <h2 className="text-2xl font-bold">
        Generate Summary
      </h2>

      <div>
        <label className="block mb-2 font-medium">
          Summary Type
        </label>

        <select
          className="w-full border rounded-lg p-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="paragraph">Paragraph</option>
          <option value="bullet">Bullet Points</option>
          <option value="keypoints">Key Points</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 font-medium">
          Summary Length
        </label>

        <select
          className="w-full border rounded-lg p-3"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Detailed</option>
        </select>
      </div>

      <Button
        className="w-full"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Summary"}
      </Button>

    </div>
  );
};

export default SummaryOptions;