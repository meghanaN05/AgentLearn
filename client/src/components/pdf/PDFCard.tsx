import { FileText, Trash2 } from "lucide-react";

interface Props {
  id: string;
  fileName: string;
  pages: number;
  size: string;
  status?: string;
  onDelete?: (id: string) => void;
}

const PDFCard = ({
  id,
  fileName,
  pages,
  size,
  status = "completed",
  onDelete,
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
            {size} · {status}
          </p>

        </div>

      </div>

      <div className="flex gap-3">

        {onDelete && (
          <button
            type="button"
            className="text-red-600"
            onClick={() => onDelete(id)}
            aria-label={`Delete ${fileName}`}
          >
            <Trash2 />
          </button>
        )}

      </div>

    </div>
  );
};

export default PDFCard;
