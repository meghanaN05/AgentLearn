import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "rounded-lg font-medium transition duration-200",

        // Size
        {
          "px-3 py-2 text-sm": size === "sm",
          "px-5 py-2": size === "md",
          "px-7 py-3 text-lg": size === "lg",
        },

        // Variants
        {
          "bg-blue-600 hover:bg-blue-700 text-white":
            variant === "primary",

          "bg-gray-200 hover:bg-gray-300 text-black":
            variant === "secondary",

          "bg-red-600 hover:bg-red-700 text-white":
            variant === "danger",

          "border border-blue-600 text-blue-600 hover:bg-blue-50":
            variant === "outline",
        },

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;