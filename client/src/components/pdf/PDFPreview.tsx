import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface Props {
  file: string | File;
}

const PDFPreview = ({ file }: Props) => {
  const [pages, setPages] = useState(0);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
      >
        {Array.from(new Array(pages), (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            width={700}
          />
        ))}
      </Document>

    </div>
  );
};

export default PDFPreview;