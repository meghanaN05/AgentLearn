import {
  Calendar,
  FileText,
  Download,
} from "lucide-react";

interface SummaryCardProps {
  title: string;
  createdAt: string;
  words: number;
  onDownload?: () => void;
}

const SummaryCard = ({
  title,
  createdAt,
  words,
  onDownload,
}: SummaryCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition">

      <div className="flex justify-between">

        <div>

          <h3 className="text-xl font-semibold">
            {title}
          </h3>

          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-3">
            <Calendar size={18} />
            <span>{createdAt}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-2">
            <FileText size={18} />
            <span>{words} Words</span>
          </div>

        </div>

        <button
          onClick={onDownload}
          className="text-blue-600 hover:text-blue-800"
        >
          <Download />
        </button>

      </div>

    </div>
  );
};

export default SummaryCard;