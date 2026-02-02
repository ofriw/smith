import React from "react";
import { cn } from "../../utils/index.ts";

export type WorkflowCardProps = {
  name: string;
  description?: string;
  steps?: string[];
  onClick: () => void;
  className?: string;
};

export function WorkflowCard({
  name,
  description,
  steps = [],
  onClick,
  className = "",
}: WorkflowCardProps) {
  const classNames = cn("workflow-card", className);

  return (
    <div
      className={classNames}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="workflow-card__header">
        <h3 className="workflow-card__name">{name}</h3>
        {description && (
          <p className="workflow-card__description">{description}</p>
        )}
      </div>

      {steps.length > 0 && (
        <div className="workflow-card__steps">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <span className="workflow-card__step">{step}</span>
              {index < steps.length - 1 && (
                <span className="workflow-card__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
