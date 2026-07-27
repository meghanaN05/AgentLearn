import { BookOpen, ArrowRight } from "lucide-react";

interface RecommendationCardProps {
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  onClick?: () => void;
}

const priorityColor = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const RecommendationCard = ({
  title,
  description,
  category,
  priority,
  onClick,
}: RecommendationCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

      <div className="flex justify-between items-start">

        <div className="flex gap-4">

          <BookOpen
            size={45}
            className="text-blue-600"
          />

          <div>

            <h2 className="font-semibold text-lg">
              {title}
            </h2>

            <p className="text-gray-500 mt-2">
              {description}
            </p>

            <div className="flex gap-3 mt-4">

              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                {category}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm ${priorityColor[priority]}`}
              >
                {priority}
              </span>

            </div>

          </div>

        </div>

        <button
          onClick={onClick}
          className="text-blue-600 hover:text-blue-800"
        >
          <ArrowRight />
        </button>

      </div>

    </div>
  );
};

export default RecommendationCard;