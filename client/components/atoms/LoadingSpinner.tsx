import React from "react";

export type LoadingSpinnerSize = "sm" | "md" | "lg";

export type LoadingSpinnerProps = {
  size?: LoadingSpinnerSize;
  className?: string;
};

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const classNames = ["loading-spinner", `loading-spinner--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classNames} role="status" aria-label="Loading">
      <svg
        className="loading-spinner__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          strokeDasharray="32"
          strokeDashoffset="12"
        />
      </svg>
    </span>
  );
}
