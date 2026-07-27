import Layout from "../components/common/Layout";
import MockTestForm from "../components/mocktest/MockTestForm";
import QuestionCard from "../components/mocktest/QuestionCard";
import Timer from "../components/mocktest/Timer";
import ResultCard from "../components/mocktest/ResultCard";
import { useState } from "react";

const MockTest = () => {

  const [started, setStarted] =
    useState(false);

  const [finished, setFinished] =
    useState(false);

  return (
    <Layout>

      <div className="space-y-8">

        <h1 className="text-3xl font-bold">

          Mock Test

        </h1>

        {!started && (

          <MockTestForm
            onStart={() =>
              setStarted(true)
            }
          />

        )}

        {started && !finished && (

          <>
            <Timer
              minutes={30}
              onComplete={() =>
                setFinished(true)
              }
            />

            <QuestionCard
              questionNumber={1}
              question="Which scheduling algorithm gives minimum waiting time?"
              options={[
                "FCFS",
                "SJF",
                "Priority",
                "RR",
              ]}
              onAnswer={() => {}}
            />

          </>

        )}

        {finished && (

          <ResultCard
            total={20}
            correct={16}
            timeTaken={28}
          />

        )}

      </div>

    </Layout>
  );
};

export default MockTest;