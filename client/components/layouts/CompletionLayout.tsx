import React, { useState } from "react";
import { Button, SelectOption } from "../atoms/index.ts";
import { StatCardProps } from "../molecules/StatCard.tsx";
import { VerificationItemProps } from "../molecules/VerificationItem.tsx";
import { CompletionSummary } from "../organisms/CompletionSummary.tsx";
import { FileChangesPanel, FileChange } from "../organisms/FileChangesPanel.tsx";
import { VerificationChecklist } from "../organisms/VerificationChecklist.tsx";
import { GitStatusPanel, GitFile } from "../organisms/GitStatusPanel.tsx";
import { StepBreakdownTable } from "../organisms/StepBreakdownTable.tsx";
import { cn } from "../../utils/index.ts";

export type StepBreakdownRow = {
  step: string;
  duration: string;
  tokens: number;
  model: string;
};

export type CompletionLayoutProps = {
  workflowName: string;
  stats: StatCardProps[];
  stepBreakdown: StepBreakdownRow[];
  fileChanges: FileChange[];
  onRevertFileChange: (id: string) => void;
  verificationItems: VerificationItemProps[];
  gitFiles: GitFile[];
  onViewDiff: (path: string) => void;
  rewindOptions: SelectOption[];
  onRewind: (stepId: string) => void;
  onNewWorkflow: () => void;
  className?: string;
};

export function CompletionLayout({
  workflowName,
  stats,
  stepBreakdown,
  fileChanges,
  onRevertFileChange,
  verificationItems,
  gitFiles,
  onViewDiff,
  onNewWorkflow,
  className = "",
}: CompletionLayoutProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'files'>('summary');
  const [breakdownExpanded, setBreakdownExpanded] = useState(false);
  const classNames = cn("completion-layout", className);

  return (
    <div className={classNames}>
      <header className="completion-layout__header">
        <div className="completion-layout__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <div className="completion-layout__header-content">
          <h1 className="completion-layout__title">Workflow Complete</h1>
          <p className="completion-layout__workflow-name">{workflowName}</p>
        </div>
      </header>

      <div className="completion-layout__tabs">
        <button
          className={`completion-layout__tab ${activeTab === 'summary' ? 'completion-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`completion-layout__tab ${activeTab === 'details' ? 'completion-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button
          className={`completion-layout__tab ${activeTab === 'files' ? 'completion-layout__tab--active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files ({fileChanges.length})
        </button>
      </div>

      <div className="completion-layout__content">
        {activeTab === 'summary' && (
          <div className="completion-layout__summary">
            <CompletionSummary stats={stats} />
            <VerificationChecklist items={verificationItems} />
          </div>
        )}

        {activeTab === 'details' && (
          <div className="completion-layout__details">
            {!breakdownExpanded ? (
              <div className="completion-layout__breakdown-summary" onClick={() => setBreakdownExpanded(true)}>
                <span>{stepBreakdown.length} steps</span>
                <span>Total: {stepBreakdown.reduce((sum, r) => sum + r.tokens, 0).toLocaleString()} tokens</span>
                <button className="completion-layout__expand-btn">Show details</button>
              </div>
            ) : (
              <>
                <StepBreakdownTable rows={stepBreakdown} />
                <button className="completion-layout__collapse-btn" onClick={() => setBreakdownExpanded(false)}>
                  Hide details
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="completion-layout__files">
            <FileChangesPanel changes={fileChanges} onRevert={onRevertFileChange} />
            <GitStatusPanel files={gitFiles} onViewDiff={onViewDiff} />
          </div>
        )}
      </div>

      <footer className="completion-layout__actions">
        <Button variant="secondary" onClick={onViewDiff.bind(null, "")}>
          View All Diffs
        </Button>
        <Button variant="primary" onClick={onNewWorkflow}>
          New Workflow
        </Button>
      </footer>
    </div>
  );
}
