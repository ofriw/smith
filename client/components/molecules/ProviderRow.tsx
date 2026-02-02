import React, { useState } from "react";
import { StatusBadge, IconButton, Chip } from "../atoms/index.ts";

export type ProviderRowProps = {
  name: string;
  adapter: string;
  status: "available" | "unavailable";
  models: string[];
  hint?: string;
  builtin?: boolean;
};

export function ProviderRow({
  name,
  adapter,
  status,
  models,
  hint,
  builtin = false,
}: ProviderRowProps) {
  const [expanded, setExpanded] = useState(false);

  const className = ["provider-row", expanded && "provider-row--expanded"]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    if (models.length > 0) {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={className}>
      <div
        className="provider-row__header"
        onClick={handleToggle}
        role={models.length > 0 ? "button" : undefined}
        tabIndex={models.length > 0 ? 0 : undefined}
        aria-expanded={models.length > 0 ? expanded : undefined}
        onKeyDown={(e) => {
          if (models.length > 0 && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="provider-row__info">
          <span className="provider-row__name">
            {name}
            {builtin && <span className="provider-row__builtin">(built-in)</span>}
          </span>
          <span className="provider-row__adapter">{adapter}</span>
          {hint && <span className="provider-row__hint">{hint}</span>}
        </div>

        <StatusBadge status={status} size="sm" />

        {models.length > 0 && (
          <span className="provider-row__expand">
            <IconButton
              icon="expand"
              size="sm"
              variant="ghost"
              label={expanded ? "Collapse models" : "Expand models"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            />
          </span>
        )}
      </div>

      {models.length > 0 && (
        <div className="provider-row__models">
          <div className="provider-row__models-title">
            Models ({models.length})
          </div>
          <div className="provider-row__models-list">
            {models.map((model) => (
              <Chip key={model}>{model}</Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
