import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SummaryViewerProps {
  summary: string;
}

const SummaryViewer = ({
  summary,
}: SummaryViewerProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-5">
        AI Generated Summary
      </h2>

      <div className="prose max-w-none">

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {summary}
        </ReactMarkdown>

      </div>

    </div>
  );
};

export default SummaryViewer;