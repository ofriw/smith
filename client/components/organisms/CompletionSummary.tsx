import React from "react";
import { StatCard, StatCardProps } from "../molecules/StatCard.tsx";
import { cn } from "../../utils/index.ts";

export type CompletionSummaryProps = {
  stats: StatCardProps[];
  className?: string;
};

export function CompletionSummary({
  stats,
  className = "",
}: CompletionSummaryProps) {
  const classNames = cn("completion-summary", className);

  return (
    <div className={classNames}>
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
