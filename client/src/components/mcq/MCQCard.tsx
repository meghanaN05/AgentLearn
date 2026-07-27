import { useState } from "react";

interface MCQCardProps {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswer: number;
  onAnswer?: (
    selected: number,
    correct: boolean
  ) => void;
}

const MCQCard = ({
  questionNumber,
  question,
  options,
  correctAnswer,
  onAnswer,
}: MCQCardProps) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;

    setSelected(index);

    onAnswer?.(
      index,
      index === correctAnswer
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="font-semibold text-lg mb-4">
        Q{questionNumber}. {question}
      </h2>

      <div className="space-y-3">

        {options.map((option, index) => {

          let classes =
            "w-full text-left border rounded-lg p-3 transition ";

          if (selected !== null) {
            if (index === correctAnswer)
              classes +=
                "bg-green-100 border-green-600";

            else if (index === selected)
              classes +=
                "bg-red-100 border-red-600";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={classes}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          );
        })}

      </div>

    </div>
  );
};

export default MCQCard;