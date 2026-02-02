import React, { useState } from "react";
import { IconButton } from "../atoms/index.ts";

export type ToolRowProps = {
  name: string;
  packageName: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  description?: string;
};

export function ToolRow({
  name,
  packageName,
  enabled,
  onToggle,
  description,
}: ToolRowProps) {
  const [expanded, setExpanded] = useState(false);

  const className = ["tool-row", expanded && "tool-row--expanded"]
    .filter(Boolean)
    .join(" ");

  const hasDetails = !!description;

  return (
    <div className={className}>
      <div
        className="tool-row__header"
        onClick={() => hasDetails && setExpanded(!expanded)}
        role={hasDetails ? "button" : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        aria-expanded={hasDetails ? expanded : undefined}
        onKeyDown={(e) => {
          if (hasDetails && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <label className="tool-row__toggle" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            className="tool-row__checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="tool-row__checkmark" />
        </label>

        <div className="tool-row__info">
          <span className="tool-row__name">{name}</span>
          <span className="tool-row__package">{packageName}</span>
        </div>

        {hasDetails && (
          <span className="tool-row__expand">
            <IconButton
              icon="expand"
              size="sm"
              variant="ghost"
              label={expanded ? "Collapse" : "Expand"}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            />
          </span>
        )}
      </div>

      {hasDetails && expanded && (
        <div className="tool-row__details">
          <p className="tool-row__description">{description}</p>
        </div>
      )}
    </div>
  );
}
