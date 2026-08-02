interface QuestionCardProps {
  questionNumber: number;
  totalQuestions?: number;
  question: string;
  options: string[];
  /** Controlled by the parent's answer map, so navigating between questions
   *  shows the answer actually saved for each one. */
  selected: number | null;
  onSelect: (index: number) => void;
}

const QuestionCard = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  selected,
  onSelect,
}: QuestionCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-xl font-semibold">
          Question {questionNumber}
          {totalQuestions ? (
            <span className="text-gray-500 dark:text-gray-400 font-normal">
              {" "}
              of {totalQuestions}
            </span>
          ) : null}
        </h2>

        {selected === null && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            Not answered
          </span>
        )}
      </div>

      <p className="mb-6">{question}</p>

      <div className="space-y-3">

        {options.map((option, index) => {
          const isSelected = selected === index;

          // Both foreground and background are set explicitly. Setting only a
          // background lets the option inherit the page's light-on-dark text
          // and disappear against a pale chip.
          const stateClasses = isSelected
            ? "bg-blue-600 border-blue-600 text-white"
            : "border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700";

          return (
            <button
              key={index}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(index)}
              className={`w-full text-left border rounded-lg p-3 transition-colors ${stateClasses}`}
            >
              <span className="font-medium mr-1">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          );
        })}

      </div>

    </div>
  );
};

export default QuestionCard;
