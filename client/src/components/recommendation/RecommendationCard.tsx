import { BookOpen, Brain, ClipboardCheck, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

import { interactive } from "../../lib/motion";

interface RecommendationCardProps {
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  /** Opens a chat seeded with a question about this topic. */
  onAsk?: () => void;
  onPractise?: () => void;
  onSummarise?: () => void;
}

const priorityColor = {
  High: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  Low: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
};

const RecommendationCard = ({
  title,
  description,
  category,
  priority,
  onAsk,
  onPractise,
  onSummarise,
}: RecommendationCardProps) => {
  return (
    <motion.div
      {...interactive}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
    >

      <div className="flex gap-4">

        <BookOpen size={40} className="text-blue-600 shrink-0" />

        <div className="min-w-0 flex-1">

          <h2 className="font-semibold text-lg">{title}</h2>

          <p className="text-gray-500 dark:text-gray-400 mt-2">{description}</p>

          <div className="flex flex-wrap gap-2 mt-4">

            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-sm">
              {category}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-sm ${priorityColor[priority]}`}
            >
              {priority}
            </span>

          </div>

          {/* Named actions rather than a bare chevron. The previous card had an
              arrow button wired to an onClick the page never passed, so
              clicking a recommendation did nothing at all. */}
          <div className="flex flex-wrap gap-2 mt-5">

            {onAsk && (
              <button
                type="button"
                onClick={onAsk}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <MessageCircle size={15} />
                Explain this
              </button>
            )}

            {onPractise && (
              <button
                type="button"
                onClick={onPractise}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Brain size={15} />
                Practise MCQs
              </button>
            )}

            {onSummarise && (
              <button
                type="button"
                onClick={onSummarise}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ClipboardCheck size={15} />
                Revision notes
              </button>
            )}

          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default RecommendationCard;
