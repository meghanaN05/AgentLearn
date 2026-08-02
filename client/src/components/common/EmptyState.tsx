import { FileQuestion } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

const EmptyState = ({
  title,
  description,
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">

      <FileQuestion
        size={70}
        className="text-gray-400"
      />

      <h2 className="text-2xl font-semibold mt-4">
        {title}
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mt-2">
        {description}
      </p>

    </div>
  );
};

export default EmptyState;