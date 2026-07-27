interface StudyTask {
  id: number;
  topic: string;
  duration: string;
  completed: boolean;
}

interface StudyPlanProps {
  tasks: StudyTask[];
}

const StudyPlan = ({
  tasks,
}: StudyPlanProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        Today's Study Plan
      </h2>

      <div className="space-y-4">

        {tasks.map((task) => (

          <div
            key={task.id}
            className="flex justify-between items-center border rounded-lg p-4"
          >

            <div>

              <h3 className="font-semibold">
                {task.topic}
              </h3>

              <p className="text-gray-500 text-sm">
                {task.duration}
              </p>

            </div>

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