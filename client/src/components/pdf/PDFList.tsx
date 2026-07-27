import PDFCard from "./PDFCard";

const pdfs = [
  {
    id: 1,
    fileName: "Operating System.pdf",
    pages: 200,
    size: "5.3 MB",
  },
  {
    id: 2,
    fileName: "CN Notes.pdf",
    pages: 130,
    size: "2.8 MB",
  },
];

const PDFList = () => {
  return (
    <div className="space-y-5">

      {pdfs.map((pdf) => (

        <PDFCard
          key={pdf.id}
          fileName={pdf.fileName}
          pages={pdf.pages}
          size={pdf.size}
        />

      ))}

    </div>
  );
};

export default PDFList;