import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = ({ label, ...props }: Props) => {
  return (
    <div className="flex flex-col gap-2">

      {label && (
        <label className="font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        {...props}
        className="border rounded-lg px-4 py-2 outline-none focus:border-blue-600"
      />

    </div>
  );
};

export default Input;