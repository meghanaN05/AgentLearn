import { useState } from "react";
import Layout from "../components/common/Layout";
import PDFUploader from "../components/pdf/PDFUploader";
import PDFList from "../components/pdf/PDFList";
import PDFPreview from "../components/pdf/PDFPreview";

const UploadPDF = () => {

  const [files, setFiles] = useState<File[]>([]);

  return (

    <Layout>

      <div className="space-y-8">

        <h1 className="text-3xl font-bold">
          Upload PDFs
        </h1>

        <PDFUploader
          onFilesSelected={(selectedFiles) =>
            setFiles(selectedFiles)
          }
        />

        {files.length > 0 && (

          <PDFPreview
            file={files[0]}
          />

        )}

        <PDFList />

      </div>

    </Layout>

  );

};

export default UploadPDF;