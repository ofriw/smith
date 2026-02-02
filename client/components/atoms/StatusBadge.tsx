import React from "react";
import { cn } from "../../utils/index.ts";

export type StatusBadgeStatus =
  | "available"
  | "running"
  | "done"
  | "error"
  | "pending"
  | "unavailable";

export type StatusBadgeProps = {
  status: StatusBadgeStatus;
  size?: "sm" | "md";
};

const statusLabels: Record<StatusBadgeStatus, string> = {
  available: "Available",
  running: "Running",
  done: "Done",
  error: "Error",
  pending: "Pending",
  unavailable: "Unavailable",
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const className = cn(
    "status-badge",
    `status-badge--${status}`,
    size === "sm" && "status-badge--sm",
  );

  return (
    <span className={className} role="status">
      {statusLabels[status]}
    </span>
  );
}
