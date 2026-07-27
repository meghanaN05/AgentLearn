import { FileText, Trash2, Eye } from "lucide-react";

interface Props {
  fileName: string;
  pages: number;
  size: string;
}

const PDFCard = ({
  fileName,
  pages,
  size,
}: Props) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 flex justify-between items-center">

      <div className="flex gap-4">

        <FileText
          size={45}
          className="text-red-600"
        />

        <div>

          <h3 className="font-semibold">
            {fileName}
          </h3>

          <p className="text-gray-500 text-sm">
            {pages} Pages
          </p>

          <p className="text-gray-500 text-sm">
            {size}
          </p>

        </div>

      </div>

      <div className="flex gap-3">

        <button className="text-blue-600">
          <Eye />
        </button>

        <button className="text-red-600">
          <Trash2 />
        </button>

      </div>

    </div>
  );
};

export default PDFCard;