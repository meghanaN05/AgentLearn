import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";

interface Props {
  onFilesSelected: (files: File[]) => void;
}

const PDFUploader = ({ onFilesSelected }: Props) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
        isDragActive
          ? "border-blue-600 bg-blue-50"
          : "border-gray-300 hover:border-blue-500"
      }`}
    >
      <input {...getInputProps()} />

      <UploadCloud
        size={60}
        className="mx-auto text-blue-600"
      />

      <h2 className="text-2xl font-semibold mt-4">
        Drag & Drop PDF Files
      </h2>

      <p className="text-gray-500 mt-2">
        or click here to browse
      </p>
    </div>
  );
};

export default PDFUploader;