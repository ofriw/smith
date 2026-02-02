import React from "react";
import { SelectOption } from "../atoms/index.ts";
import { HistoryEntryProps } from "../molecules/index.ts";
import { HistoryPanel } from "../organisms/HistoryPanel.tsx";
import { cn } from "../../utils/index.ts";

export type HistoryLayoutProps = {
  projectName: string;
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

export function HistoryLayout({
  projectName,
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
}: HistoryLayoutProps) {
  const classNames = cn("history-layout", className);

  return (
    <div className={classNames}>
      <header className="history-layout__header">
        <h1 className="history-layout__title">
          WORKFLOW HISTORY
          <span className="history-layout__project"> — {projectName}</span>
        </h1>
      </header>

      <main className="history-layout__main">
        <HistoryPanel
          entries={entries}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          projectOptions={projectOptions}
          selectedProject={selectedProject}
          onProjectChange={onProjectChange}
          totalSessions={totalSessions}
          totalDuration={totalDuration}
          onNewWorkflow={onNewWorkflow}
          onExportHistory={onExportHistory}
        />
      </main>
    </div>
  );
}
