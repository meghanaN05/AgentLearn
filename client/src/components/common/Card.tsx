import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
}

const Card = ({ children, title }: Props) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">

      {title && (
        <h2 className="text-xl font-semibold mb-4">
          {title}
        </h2>
      )}

      {children}

    </div>
  );
};

export default Card;