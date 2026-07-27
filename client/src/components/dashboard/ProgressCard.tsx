interface ProgressCardProps {
  title: string;
  progress: number;
  color?: string;
}

const ProgressCard = ({
  title,
  progress,
  color = "bg-blue-600",
}: ProgressCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <div className="flex justify-between mb-3">

        <h3 className="font-semibold">
          {title}
        </h3>

        <span className="font-bold text-blue-600">
          {progress}%
        </span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">

        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />

      </div>

    </div>
  );
};

export default ProgressCard;