import React from "react";
import { StepBreakdownRow } from "../layouts/CompletionLayout.tsx";
import { cn } from "../../utils/index.ts";

export type StepBreakdownTableProps = {
  rows: StepBreakdownRow[];
  className?: string;
};

export function StepBreakdownTable({
  rows,
  className = "",
}: StepBreakdownTableProps) {
  const classNames = cn("completion-layout__table", className);

  return (
    <table className={classNames}>
      <thead>
        <tr>
          <th>Step</th>
          <th>Duration</th>
          <th>Tokens</th>
          <th>Model</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.step}>
            <td>{row.step}</td>
            <td>{row.duration}</td>
            <td>{row.tokens.toLocaleString()}</td>
            <td>{row.model}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
