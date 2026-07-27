const pdfs = [
  {
    id: 1,
    name: "Operating System.pdf",
  },
  {
    id: 2,
    name: "DBMS Notes.pdf",
  },
  {
    id: 3,
    name: "CN Unit 3.pdf",
  },
];

const RecentPDFs = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-4">
        Recent PDFs
      </h2>

      <div className="space-y-3">

        {pdfs.map((pdf) => (

          <div
            key={pdf.id}
            className="border rounded-lg p-3 hover:bg-gray-100 cursor-pointer"
          >
            {pdf.name}
          </div>

        ))}

      </div>

    </div>
  );
};

export default RecentPDFs;