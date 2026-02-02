import React, { useState } from "react";
import { cn } from "../../utils/index.ts";

type ErrorType = "typescript" | "runtime" | "network" | "default";

function detectErrorType(message: string): ErrorType {
  const lower = message.toLowerCase();
  if (
    lower.includes("typescript") ||
    lower.includes("ts") ||
    lower.includes("type") ||
    lower.includes("compile")
  ) {
    return "typescript";
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("connection") ||
    lower.includes("timeout")
  ) {
    return "network";
  }
  if (
    lower.includes("runtime") ||
    lower.includes("undefined") ||
    lower.includes("null") ||
    lower.includes("exception")
  ) {
    return "runtime";
  }
  return "default";
}

function getErrorSuggestions(message: string): string[] {
  const suggestions: string[] = [];
  const lower = message.toLowerCase();

  if (lower.includes("undefined") || lower.includes("null")) {
    suggestions.push("Check if the variable is initialized before use");
  }
  if (lower.includes("type") || lower.includes("typescript")) {
    suggestions.push("Verify type definitions match the data");
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("connection")
  ) {
    suggestions.push("Check network connectivity");
    suggestions.push("Verify the endpoint URL is correct");
  }
  if (lower.includes("timeout")) {
    suggestions.push("Increase timeout duration");
    suggestions.push("Check if the server is responding");
  }
  if (lower.includes("permission") || lower.includes("access")) {
    suggestions.push("Verify you have the required permissions");
  }

  return suggestions.slice(0, 3);
}

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const LightningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const WifiOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const errorIcons: Record<ErrorType, React.FC> = {
  typescript: CodeIcon,
  runtime: LightningIcon,
  network: WifiOffIcon,
  default: AlertCircleIcon,
};

export type ErrorStateCardProps = {
  title?: string;
  fileReference?: string;
  errorMessage: string;
  fullStack?: string;
  className?: string;
};

export function ErrorStateCard({
  title = "EXECUTION FAILED",
  fileReference,
  errorMessage,
  fullStack,
  className = "",
}: ErrorStateCardProps) {
  const [showMore, setShowMore] = useState(false);

  const classNames = cn("error-state-card", className);
  const errorType = detectErrorType(errorMessage);
  const IconComponent = errorIcons[errorType];
  const suggestions = getErrorSuggestions(errorMessage);

  return (
    <div className={classNames}>
      <div className="error-state-card__header">
        <span className="error-state-card__icon" aria-hidden="true">
          <IconComponent />
        </span>
        <span className="error-state-card__title">{title}</span>
      </div>

      {fileReference && (
        <a
          href="#"
          className="error-state-card__file-ref"
          onClick={(e) => {
            e.preventDefault();
            // Could open file in editor
          }}
        >
          {fileReference}
        </a>
      )}

      <pre className="error-state-card__message">{errorMessage}</pre>

      {suggestions.length > 0 && (
        <div className="error-state-card__suggestions">
          <span className="error-state-card__suggestions-label">Try:</span>
          <ul className="error-state-card__suggestions-list">
            {suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {fullStack && (
        <>
          <button
            className="error-state-card__toggle"
            onClick={() => setShowMore(!showMore)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="16"
              height="16"
              className={`error-state-card__toggle-icon ${showMore ? "error-state-card__toggle-icon--expanded" : ""}`}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            {showMore ? "Show less" : "Show more"}
          </button>
          {showMore && (
            <pre className="error-state-card__stack">{fullStack}</pre>
          )}
        </>
      )}
    </div>
  );
}
