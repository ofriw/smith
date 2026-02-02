import React from "react";
import { cn } from "../../utils/index.ts";

export type StatCardProps = {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

export function StatCard({
  label,
  value,
  trend,
  className = "",
}: StatCardProps) {
  const classNames = cn("stat-card", className);

  return (
    <div className={classNames}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">
        {value}
        {trend && (
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            {trend === "up" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            )}
            {trend === "down" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            )}
          </span>
        )}
      </span>
    </div>
  );
}
