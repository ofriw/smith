import React from "react";
import { SearchInput, WorkflowCard, WorkflowCardProps } from "../molecules/index.ts";

export type WorkflowGroup = {
  title: string;
  path: string;
  workflows: WorkflowCardProps[];
};

export type RecentWorkflow = {
  id: string;
  name: string;
  timestamp: string;
  onClick: () => void;
};

export type EmptyStateContentProps = {
  projectName: string;
  branch: string;
  projectPath: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  workflowGroups: WorkflowGroup[];
  recentWorkflows: RecentWorkflow[];
  onCreateWorkflow: () => void;
};

export function EmptyStateContent({
  projectName,
  branch,
  projectPath,
  searchValue,
  onSearchChange,
  workflowGroups,
  recentWorkflows,
  onCreateWorkflow,
}: EmptyStateContentProps) {
  const filteredGroups = workflowGroups.map((group) => ({
    ...group,
    workflows: group.workflows.filter(
      (w) =>
        w.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchValue.toLowerCase())
    ),
  }));

  const filteredRecent = recentWorkflows.filter((r) =>
    r.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="empty-state-content">
      <header className="empty-state-content__header">
        <div className="empty-state-content__project">
          <h1 className="empty-state-content__project-name">{projectName}</h1>
          <div className="empty-state-content__project-meta">
            <span className="empty-state-content__branch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9" />
              </svg>
              {branch}
            </span>
            <span className="empty-state-content__path">{projectPath}</span>
          </div>
        </div>
      </header>

      <div className="empty-state-content__search">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search workflows..."
        />
      </div>

      <div className="empty-state-content__workflows">
        {filteredGroups.map((group) => (
          <section key={group.path} className="empty-state-content__section">
            <h2 className="empty-state-content__section-title">
              {group.title}
              <span className="empty-state-content__section-path">{group.path}</span>
            </h2>
            {group.workflows.length === 0 ? (
              <p className="empty-state-content__empty">No workflows found</p>
            ) : (
              <div className="empty-state-content__cards">
                {group.workflows.map((workflow) => (
                  <WorkflowCard key={workflow.name} {...workflow} />
                ))}
              </div>
            )}
          </section>
        ))}

        <button
          className="empty-state-content__create"
          onClick={onCreateWorkflow}
        >
          <span className="empty-state-content__create-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          Create Custom Workflow
        </button>

        {recentWorkflows.length > 0 && (
          <section className="empty-state-content__section">
            <h2 className="empty-state-content__section-title">
              Recent
              <span className="empty-state-content__section-path">this project</span>
            </h2>
            <div className="empty-state-content__recent">
              {filteredRecent.map((recent) => (
                <button
                  key={recent.id}
                  className="empty-state-content__recent-item"
                  onClick={recent.onClick}
                >
                  <span className="empty-state-content__recent-name">
                    {recent.name}
                  </span>
                  <span className="empty-state-content__recent-time">
                    {recent.timestamp}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
