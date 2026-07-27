import { useState } from "react";
import Layout from "../components/common/Layout";
import SummaryOptions from "../components/summary/SummaryOptions";
import SummaryViewer from "../components/summary/SummaryViewer";
import SummaryCard from "../components/summary/SummaryCard";

const Summary = () => {
  const [summary, setSummary] = useState("");

  const handleGenerate = (
    type: string,
    length: string
  ) => {
    console.log(type, length);

    // Replace with FastAPI API call
    setSummary(`
# Operating Systems

## Process Management

A process is a program in execution.

### Scheduling
- FCFS
- SJF
- Round Robin

### Synchronization
- Semaphore
- Mutex
- Monitor
`);
  };

  return (
    <Layout>
      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          AI Summary
        </h1>

        <SummaryOptions
          onGenerate={handleGenerate}
        />

        {summary && (
          <>
            <SummaryViewer summary={summary} />

            <SummaryCard
              title="Operating Systems Summary"
              createdAt={new Date().toLocaleDateString()}
              words={210}
            />
          </>
        )}

      </div>
    </Layout>
  );
};

export default Summary;