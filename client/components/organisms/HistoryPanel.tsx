import React from "react";
import { Button, Select, SelectOption } from "../atoms/index.ts";
import { SearchInput, HistoryEntry, HistoryEntryProps } from "../molecules/index.ts";
import { cn } from "../../utils/index.ts";

export type HistoryPanelProps = {
  entries: HistoryEntryProps[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  projectOptions: SelectOption[];
  selectedProject: string;
  onProjectChange: (value: string) => void;
  totalSessions: number;
  totalDuration: string;
  onNewWorkflow: () => void;
  onExportHistory: () => void;
  className?: string;
};

export function HistoryPanel({
  entries,
  searchValue,
  onSearchChange,
  projectOptions,
  selectedProject,
  onProjectChange,
  totalSessions,
  totalDuration,
  onNewWorkflow,
  onExportHistory,
  className = "",
}: HistoryPanelProps) {
  const classNames = cn("history-panel", className);

  return (
    <div className={classNames}>
      <div className="history-panel__filters">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search history..."
        />
        <Select
          value={selectedProject}
          onChange={onProjectChange}
          options={projectOptions}
          placeholder="All projects"
        />
      </div>

      <div className="history-panel__list">
        {entries.length === 0 ? (
          <div className="history-panel__empty">No history entries found</div>
        ) : (
          entries.map((entry) => (
            <HistoryEntry key={entry.id} {...entry} />
          ))
        )}
      </div>

      <div className="history-panel__footer">
        <div className="history-panel__stats">
          <span>{totalSessions} sessions</span>
          <span className="history-panel__stat-divider">|</span>
          <span>{totalDuration} total</span>
        </div>
        <div className="history-panel__actions">
          <Button variant="secondary" size="sm" onClick={onExportHistory}>
            Export History
          </Button>
          <Button variant="primary" size="sm" onClick={onNewWorkflow}>
            New Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}
