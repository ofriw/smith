import React from "react";
import { cn } from "../../utils/index.ts";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  onClick,
  className = "",
}: ButtonProps) {
  const classNames = cn(
    "button",
    `button--${variant}`,
    `button--${size}`,
    loading && "button--loading",
    className,
  );

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <span className="button__spinner" aria-hidden="true">
          <svg className="button__spinner-icon" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="12"
            />
          </svg>
        </span>
      )}
      <span className={loading ? "button__content--hidden" : "button__content"}>
        {children}
      </span>
    </button>
  );
}
