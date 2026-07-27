const chats = [
  {
    id: 1,
    question: "Explain Binary Trees",
  },
  {
    id: 2,
    question: "Summarize Chapter 4",
  },
  {
    id: 3,
    question: "Generate MCQs",
  },
];

const RecentChats = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-4">
        Recent Chats
      </h2>

      <div className="space-y-3">

        {chats.map((chat) => (

          <div
            key={chat.id}
            className="border rounded-lg p-3 hover:bg-gray-100 cursor-pointer"
          >
            {chat.question}
          </div>

        ))}

      </div>

    </div>
  );
};

export default RecentChats;