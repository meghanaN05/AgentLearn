import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";

import pdfService, { PDFResponse } from "../../services/pdfService";
import { formatFileSize } from "../../utils/helpers";
import useDebounce from "../../hooks/useDebounce";
import Loader from "../common/Loader";
import PDFCard from "./PDFCard";

const PDFList = () => {
  const [pdfs, setPdfs] = useState<PDFResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Debounced so typing does not fire a request per keystroke.
  const debouncedSearch = useDebounce(search, 300);

  const loadPDFs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pdfService.getPDFs(debouncedSearch || undefined);
      setPdfs(data);
    } catch {
      toast.error("Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadPDFs();
  }, [loadPDFs]);

  const handleDelete = async (id: string) => {
    try {
      await pdfService.deletePDF(id);
      toast.success("PDF deleted");
      setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
    } catch {
      toast.error("Failed to delete PDF");
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const filename = window.prompt("Rename document", currentName);

    if (!filename || filename === currentName) {
      return;
    }

    try {
      const updated = await pdfService.renamePDF(id, filename);
      setPdfs((prev) => prev.map((pdf) => (pdf.id === id ? updated : pdf)));
      toast.success("PDF renamed");
    } catch {
      toast.error("Failed to rename PDF");
    }
  };

  return (
    <div className="space-y-5">

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
        <Search size={18} className="text-gray-400" />
        <input
          className="w-full outline-none"
          placeholder="Search your documents"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      )}

      {!loading && pdfs.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {debouncedSearch
            ? `No documents match "${debouncedSearch}".`
            : "No PDFs uploaded yet. Drop files above to get started."}
        </p>
      )}

      {!loading &&
        pdfs.map((pdf) => (
          <PDFCard
            key={pdf.id}
            id={pdf.id}
            fileName={pdf.filename}
            pages={pdf.pages}
            size={formatFileSize(pdf.size)}
            status={pdf.processing_status}
            onDelete={handleDelete}
            onRename={() => handleRename(pdf.id, pdf.filename)}
          />
        ))}

    </div>
  );
};

export default PDFList;
