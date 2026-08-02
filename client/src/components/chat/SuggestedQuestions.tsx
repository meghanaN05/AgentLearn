interface Props {
  onSelect: (question: string) => void;
}

const suggestions = [
  "Summarize this PDF",
  "Generate 20 MCQs",
  "Explain the important concepts",
  "Create short notes",
  "What are the interview questions?",
];

const SuggestedQuestions = ({ onSelect }: Props) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center max-w-lg">
      {suggestions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onSelect(question)}
          className="px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-200 text-sm"
        >
          {question}
        </button>
      ))}
    </div>
  );
};

export default SuggestedQuestions;