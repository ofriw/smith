import React, { useState } from "react";

export type KeyValueRowProps = {
  label: string;
  value: React.ReactNode;
  action?: { label: string; onClick: () => void };
  truncate?: boolean;
};

export function KeyValueRow({
  label,
  value,
  action,
  truncate = false,
}: KeyValueRowProps) {
  const [expanded, setExpanded] = useState(false);

  const handleValueClick = () => {
    if (truncate) {
      setExpanded(!expanded);
    }
  };

  const valueClassName = [
    "key-value-row__value",
    truncate && !expanded && "key-value-row__value--truncate",
    truncate && expanded && "key-value-row__value--expanded",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="key-value-row">
      <span className="key-value-row__label">{label}</span>
      <div className="key-value-row__content">
        <span
          className={valueClassName}
          onClick={truncate ? handleValueClick : undefined}
          role={truncate ? "button" : undefined}
          tabIndex={truncate ? 0 : undefined}
          onKeyDown={
            truncate
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleValueClick();
                  }
                }
              : undefined
          }
        >
          {value}
        </span>
        {action && (
          <div className="key-value-row__action">
            <button
              type="button"
              className="key-value-row__action-btn"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
