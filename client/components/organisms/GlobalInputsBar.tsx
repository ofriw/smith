import React, { useState, useId } from "react";
import { cn } from "../../utils/index.ts";
import { DataSummary } from "../molecules/DataSummary.tsx";

export type GlobalInputsBarProps = {
  inputs: Record<string, unknown>;
  workflowName: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onEdit?: () => void;
};

export function GlobalInputsBar({
  inputs,
  workflowName,
  collapsed: controlledCollapsed,
  onToggle,
  onEdit,
}: GlobalInputsBarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const id = useId();
  const contentId = `global-inputs-${id}`;

  const collapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  const isEmpty = Object.keys(inputs).length === 0;
  const previewText = isEmpty
    ? "No inputs"
    : Object.entries(inputs)
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${typeof v === "string" ? v.slice(0, 20) : String(v)}`)
        .join(", ");

  return (
    <div className={cn("global-inputs-bar", collapsed && "global-inputs-bar--collapsed")}>
      <div
        className="global-inputs-bar__header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-controls={contentId}
      >
        <span className="global-inputs-bar__chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="12"
            height="12"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <span className="global-inputs-bar__title">{workflowName}</span>
        {collapsed && !isEmpty && (
          <span className="global-inputs-bar__preview">{previewText}</span>
        )}
        {onEdit && (
          <button
            type="button"
            className="global-inputs-bar__edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </button>
        )}
      </div>
      <div className="global-inputs-bar__body" id={contentId}>
        <div className="global-inputs-bar__body-inner">
          <DataSummary data={inputs} />
        </div>
      </div>
    </div>
  );
}
