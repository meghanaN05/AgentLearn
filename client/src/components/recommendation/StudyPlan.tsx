interface StudyTask {
  id: string;
  topic: string;
  duration: string;
  completed: boolean;
}

interface StudyPlanProps {
  tasks: StudyTask[];
  /** Makes each row open a chat about that topic. */
  onSelectTopic?: (topic: string) => void;
}

const StudyPlan = ({
  tasks,
  onSelectTopic,
}: StudyPlanProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        Today's Study Plan
      </h2>

      <div className="space-y-4">

        {tasks.map((task) => (

          <div
            key={task.id}
            className="flex justify-between items-center border dark:border-gray-700 rounded-lg p-4"
          >

            <button
              type="button"
              disabled={!onSelectTopic}
              onClick={() => onSelectTopic?.(task.topic)}
              className="text-left enabled:hover:text-blue-600 disabled:cursor-default"
            >

              <h3 className="font-semibold">
                {task.topic}
              </h3>

              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {task.duration}
              </p>

            </button>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                task.completed
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {task.completed
                ? "Completed"
                : "Pending"}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
};

export default StudyPlan;