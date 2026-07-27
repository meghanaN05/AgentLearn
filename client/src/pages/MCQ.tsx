import { useState } from "react";
import Layout from "../components/common/Layout";
import MCQForm from "../components/mcq/MCQForm";
import MCQCard from "../components/mcq/MCQCard";
import MCQResult from "../components/mcq/MCQResult";

const sampleQuestions = [
  {
    question:
      "Which scheduling algorithm may cause starvation?",
    options: [
      "FCFS",
      "Round Robin",
      "Priority Scheduling",
      "FIFO",
    ],
    answer: 2,
  },
];

const MCQ = () => {
  const [generated, setGenerated] = useState(false);
  const [score, setScore] = useState(0);

  return (
    <Layout>

      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          Generate MCQs
        </h1>

        {!generated && (

          <MCQForm
            onGenerate={() =>
              setGenerated(true)
            }
          />

        )}

        {generated && (

          <>
            {sampleQuestions.map((mcq, index) => (

              <MCQCard
                key={index}
                questionNumber={index + 1}
                question={mcq.question}
                options={mcq.options}
                correctAnswer={mcq.answer}
                onAnswer={(_, correct) => {
                  if (correct)
                    setScore((prev) => prev + 1);
                }}
              />

            ))}

            <MCQResult
              total={sampleQuestions.length}
              correct={score}
            />

          </>

        )}

      </div>

    </Layout>
  );
};

export default MCQ;