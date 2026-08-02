import { useState } from "react";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  options: string[];
  onAnswer: (selected: number) => void;
}

const QuestionCard = ({
  questionNumber,
  question,
  options,
  onAnswer,
}: QuestionCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setSelected(index);
    onAnswer(index);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

      <h2 className="text-xl font-semibold mb-5">
        Question {questionNumber}
      </h2>

      <p className="mb-6">{question}</p>

      <div className="space-y-3">

        {options.map((option, index) => (

          <button
            key={index}
            onClick={() => handleClick(index)}
            className={`w-full text-left border rounded-lg p-3 transition ${
              selected === index
                ? "bg-blue-100 border-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            {String.fromCharCode(65 + index)}. {option}
          </button>

        ))}

      </div>

    </div>
  );
};

export default QuestionCard;