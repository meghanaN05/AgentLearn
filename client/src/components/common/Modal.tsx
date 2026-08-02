import type { ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal = ({
  open,
  onClose,
  title,
  children,
}: Props) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-[600px]">

        <div className="flex justify-between items-center border-b p-5">

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="p-6">
          {children}
        </div>

      </div>

    </div>
  );
};

export default Modal;