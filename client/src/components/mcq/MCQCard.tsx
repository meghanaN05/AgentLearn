interface MCQCardProps {
  questionNumber: number;
  question: string;
  options: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  /** Present only after server-side grading; drives the answer colouring. */
  revealed?: {
    correctAnswer: number;
    isCorrect: boolean;
    explanation?: string | null;
  };
}

const MCQCard = ({
  questionNumber,
  question,
  options,
  selected,
  onSelect,
  revealed,
}: MCQCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="font-semibold text-lg mb-4">
        Q{questionNumber}. {question}
      </h2>

      <div className="space-y-3">

        {options.map((option, index) => {

          let classes =
            "w-full text-left border rounded-lg p-3 transition ";

          if (revealed) {
            if (index === revealed.correctAnswer)
              classes += "bg-green-100 border-green-600";
            else if (index === selected)
              classes += "bg-red-100 border-red-600";
          } else if (index === selected) {
            classes += "bg-blue-50 border-blue-600";
          }

          return (
            <button
              key={index}
              type="button"
              disabled={Boolean(revealed)}
              onClick={() => onSelect(index)}
              className={classes}
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          );
        })}

      </div>

      {revealed && (
        <div className="mt-4 text-sm">
          {selected === null && (
            <p className="text-amber-700 font-medium">Not answered</p>
          )}
          {revealed.explanation && (
            <p className="text-gray-600 mt-1">{revealed.explanation}</p>
          )}
        </div>
      )}

    </div>
  );
};

export default MCQCard;
