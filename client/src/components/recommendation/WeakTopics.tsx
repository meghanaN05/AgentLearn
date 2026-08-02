interface WeakTopic {
  topic: string;
  score: number;
}

interface WeakTopicsProps {
  topics: WeakTopic[];
}

const WeakTopics = ({
  topics,
}: WeakTopicsProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-6">
        Weak Topics
      </h2>

      <div className="space-y-5">

        {topics.map((topic) => (

          <div key={topic.topic}>

            <div className="flex justify-between mb-2">

              <span className="font-medium">
                {topic.topic}
              </span>

              <span className="text-red-600 font-semibold">
                {topic.score}%
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">

              <div
                className="bg-red-500 h-3 rounded-full transition-all"
                style={{
                  width: `${topic.score}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>
  );
};

export default WeakTopics;