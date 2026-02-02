import React, { useState } from "react";
import { IconButton } from "../atoms/index.ts";

export type VerificationStatus = "pass" | "fail" | "pending" | "skipped";

export type VerificationItemProps = {
  label: string;
  status: VerificationStatus;
  details?: string;
  className?: string;
};

export function VerificationItem({
  label,
  status,
  details,
  className = "",
}: VerificationItemProps) {
  const [expanded, setExpanded] = useState(false);

  const hasDetails = status === "fail" && details;

  const classNames = [
    "verification-item",
    `verification-item--${status}`,
    expanded && "verification-item--expanded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div
        className="verification-item__header"
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
        <span className="verification-item__icon" aria-hidden="true">
          {status === "pass" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
          {status === "fail" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          )}
          {status === "pending" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
          {status === "skipped" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          )}
        </span>
        <span className="verification-item__label">{label}</span>
        <span className="verification-item__status">{status}</span>
        {hasDetails && (
          <span className="verification-item__expand">
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
        <div className="verification-item__details">
          <pre className="verification-item__details-content">{details}</pre>
        </div>
      )}
    </div>
  );
}
