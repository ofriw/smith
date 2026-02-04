import React, { useState } from "react";
import { cn } from "../../utils/index.ts";

export type DataSummaryProps = {
  data: Record<string, unknown>;
  maxLength?: number;
  className?: string;
};

function formatValue(value: unknown, maxLength: number): { text: string; truncated: boolean } {
  if (value === null) return { text: "null", truncated: false };
  if (value === undefined) return { text: "undefined", truncated: false };

  if (typeof value === "string") {
    if (value.length > maxLength) {
      return { text: `"${value.slice(0, maxLength)}..."`, truncated: true };
    }
    return { text: `"${value}"`, truncated: false };
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return { text: String(value), truncated: false };
  }

  if (Array.isArray(value)) {
    return { text: `Array(${value.length})`, truncated: value.length > 0 };
  }

  if (typeof value === "object") {
    const keys = Object.keys(value);
    return { text: `Object(${keys.length} keys)`, truncated: keys.length > 0 };
  }

  return { text: String(value), truncated: false };
}

function getValueClass(value: unknown): string {
  if (value === null || value === undefined) return "data-summary__value--null";
  if (typeof value === "string") return "data-summary__value--string";
  if (typeof value === "number") return "data-summary__value--number";
  if (typeof value === "boolean") return "data-summary__value--boolean";
  return "";
}

export function DataSummary({
  data,
  maxLength = 100,
  className,
}: DataSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(data);
  const isEmpty = entries.length === 0;

  if (isEmpty) {
    return (
      <div className={cn("data-summary", "data-summary--empty", className)}>
        <span className="data-summary__empty">No data</span>
      </div>
    );
  }

  if (expanded) {
    return (
      <div className={cn("data-summary", "data-summary--expanded", className)}>
        <pre className="data-summary__full">
          {JSON.stringify(data, null, 2)}
        </pre>
        <button
          type="button"
          className="data-summary__toggle"
          onClick={() => setExpanded(false)}
        >
          Show less
        </button>
      </div>
    );
  }

  const hasComplexValues = entries.some(([, v]) => {
    const { truncated } = formatValue(v, maxLength);
    return truncated;
  });

  return (
    <div className={cn("data-summary", className)}>
      <div className="data-summary__pairs">
        {entries.map(([key, value]) => {
          const { text, truncated } = formatValue(value, maxLength);
          return (
            <span key={key} className="data-summary__pair">
              <span className="data-summary__key">{key}:</span>
              <span className={cn("data-summary__value", getValueClass(value))}>
                {text}
                {truncated && (
                  <span className="data-summary__truncated-indicator" />
                )}
              </span>
            </span>
          );
        })}
      </div>
      {hasComplexValues && (
        <button
          type="button"
          className="data-summary__toggle"
          onClick={() => setExpanded(true)}
        >
          Show more
        </button>
      )}
    </div>
  );
}
