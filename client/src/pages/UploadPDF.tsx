import { useState } from "react";
import toast from "react-hot-toast";

import Layout from "../components/common/Layout";
import PDFUploader from "../components/pdf/PDFUploader";
import PDFList from "../components/pdf/PDFList";
import PDFPreview from "../components/pdf/PDFPreview";
import pdfService from "../services/pdfService";

const UploadPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpload = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);

    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);

    try {
      // Upload returns as soon as the file is stored; extraction and embedding
      // run in the background, so each document is followed to completion.
      for (const file of selectedFiles) {
        const uploaded = await pdfService.uploadPDF(file);
        const processed = await pdfService.waitForProcessing(uploaded.id);

        if (processed.processing_status === "failed") {
          toast.error(
            `${processed.filename}: ${
              processed.processing_error ?? "processing failed"
            }`
          );
        }
      }

      toast.success(
        selectedFiles.length === 1
          ? "PDF uploaded and indexed"
          : `${selectedFiles.length} PDFs uploaded and indexed`
      );
      setRefreshKey((prev) => prev + 1);
    } catch {
      toast.error("Upload failed. Check file size and backend connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">
          Upload PDFs
        </h1>

        <PDFUploader
          onFilesSelected={handleUpload}
          disabled={uploading}
        />

        {uploading && (
          <p className="text-blue-600 text-center">
            Uploading and indexing your document...
          </p>
        )}

        {files.length > 0 && !uploading && (
          <PDFPreview file={files[0]} />
        )}

        <PDFList key={refreshKey} />
      </div>
    </Layout>
  );
};

export default UploadPDF;
