import React from "react";

export type ProgressDotState = "pending" | "active" | "completed" | "error";

export type ProgressDotProps = {
  state: ProgressDotState;
};

export function ProgressDot({ state }: ProgressDotProps) {
  return (
    <span
      className={`progress-dot progress-dot--${state}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}
