import React, { useState, useId } from "react";
import { cn } from "../../utils/index.ts";

export type StepStatus = "pending" | "active" | "completed" | "error";

export type StepSectionProps = {
  title: "Input" | "Tool Calls" | "Output";
  stepStatus?: StepStatus;
  defaultExpanded?: boolean;
  count?: number;
  children: React.ReactNode;
};

function getSmartExpanded(
  title: StepSectionProps["title"],
  stepStatus: StepStatus | undefined,
  defaultExpanded: boolean
): boolean {
  if (stepStatus === undefined) return defaultExpanded;

  switch (stepStatus) {
    case "error":
      return true; // All sections expanded on error
    case "active":
      return title === "Tool Calls" || title === "Output";
    case "completed":
      return title === "Output";
    case "pending":
    default:
      return false;
  }
}

export function StepSection({
  title,
  stepStatus,
  defaultExpanded = false,
  count,
  children,
}: StepSectionProps) {
  const smartDefault = getSmartExpanded(title, stepStatus, defaultExpanded);
  const [expanded, setExpanded] = useState(smartDefault);
  const id = useId();
  const contentId = `section-${id}`;

  const handleToggle = () => setExpanded(!expanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  const displayTitle = count !== undefined ? `${title} (${count})` : title;

  return (
    <div className={cn("step-section", expanded && "step-section--expanded")}>
      <div
        className="step-section__header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <span className="step-section__chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="12"
            height="12"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
        <span className="step-section__title">{displayTitle}</span>
      </div>
      <div className="step-section__body" id={contentId}>
        <div className="step-section__body-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
