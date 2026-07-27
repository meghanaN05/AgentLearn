import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

const Button = ({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "px-5 py-2 rounded-lg font-medium transition duration-200",

        variant === "primary" &&
          "bg-blue-600 hover:bg-blue-700 text-white",

        variant === "secondary" &&
          "bg-gray-200 hover:bg-gray-300 text-black",

        variant === "danger" &&
          "bg-red-600 hover:bg-red-700 text-white",

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;