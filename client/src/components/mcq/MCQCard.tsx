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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="font-semibold text-lg mb-4">
        Q{questionNumber}. {question}
      </h2>

      <div className="space-y-3">

        {options.map((option, index) => {

          // Foreground is always set alongside background: a pale chip with
          // inherited light-on-dark text is unreadable in dark mode.
          let stateClasses =
            "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700";

          if (revealed) {
            if (index === revealed.correctAnswer) {
              stateClasses = "bg-green-600 border-green-600 text-white";
            } else if (index === selected) {
              stateClasses = "bg-red-600 border-red-600 text-white";
            } else {
              stateClasses =
                "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400";
            }
          } else if (index === selected) {
            stateClasses = "bg-blue-600 border-blue-600 text-white";
          }

          return (
            <button
              key={index}
              type="button"
              aria-pressed={index === selected}
              disabled={Boolean(revealed)}
              onClick={() => onSelect(index)}
              className={`w-full text-left border rounded-lg p-3 transition-colors disabled:cursor-default ${stateClasses}`}
            >
              <span className="font-medium mr-1">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
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
            <p className="text-gray-600 dark:text-gray-300 mt-1">{revealed.explanation}</p>
          )}
        </div>
      )}

    </div>
  );
};

export default MCQCard;
