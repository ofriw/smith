import React, { useState, useEffect, useId } from "react";
import { Button } from "../atoms/index.ts";
import { SearchInput, DataSummary } from "../molecules/index.ts";
import { SchemaForm } from "./SchemaForm.tsx";
import type { SchemaField } from "./SchemaForm.tsx";
import type { WorkflowListGroup } from "./WorkflowSelectionPanel.tsx";
import { cn } from "../../utils/index.ts";

export type InitializeCardProps = {
  // Workflow selection
  workflowGroups: WorkflowListGroup[];
  selectedWorkflowId?: string;
  onWorkflowSelect: (id: string) => void;
  // Inputs
  inputSchema: SchemaField[];
  inputValues: Record<string, unknown>;
  onInputChange: (name: string, value: unknown) => void;
  inputErrors?: Record<string, string>;
  // Actions
  onStartWorkflow: () => void;
  isStartDisabled?: boolean;
  // Session state
  isSessionActive: boolean;
  activeWorkflowName?: string;
};

export function InitializeCard({
  workflowGroups,
  selectedWorkflowId,
  onWorkflowSelect,
  inputSchema,
  inputValues,
  onInputChange,
  inputErrors,
  onStartWorkflow,
  isStartDisabled = false,
  isSessionActive,
  activeWorkflowName,
}: InitializeCardProps) {
  const [expanded, setExpanded] = useState(!isSessionActive);
  const [searchQuery, setSearchQuery] = useState("");
  const id = useId();
  const contentId = `initialize-card-content-${id}`;

  // Auto-collapse when session starts, auto-expand when session ends
  useEffect(() => {
    setExpanded(!isSessionActive);
  }, [isSessionActive]);

  const handleToggle = () => setExpanded(!expanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  // Filter workflows by search query
  const filteredGroups = workflowGroups
    .map((group) => ({
      ...group,
      workflows: group.workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.description &&
            w.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((group) => group.workflows.length > 0);

  const title = isSessionActive && activeWorkflowName
    ? activeWorkflowName
    : "Initialize Workflow";

  const classNames = cn(
    "initialize-card",
    expanded && "initialize-card--expanded",
    isSessionActive && "initialize-card--active"
  );

  return (
    <div className={classNames}>
      <div
        className="initialize-card__header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={contentId}
      >
        <span className="initialize-card__badge" aria-hidden="true">
          {isSessionActive ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              width="14"
              height="14"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </span>
        <h3 className="initialize-card__title">{title}</h3>
        <span className="initialize-card__chevron" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="16"
            height="16"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>

      {/* Collapsed summary - only show when session active and collapsed */}
      {isSessionActive && !expanded && Object.keys(inputValues).length > 0 && (
        <div className="initialize-card__summary">
          <DataSummary data={inputValues} />
        </div>
      )}

      <div className="initialize-card__body" id={contentId}>
        <div className="initialize-card__content">
          {!isSessionActive ? (
            // Before session: show workflow selection and inputs
            <>
              <div className="initialize-card__search">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search workflows..."
                />
              </div>

              <div className="initialize-card__workflows">
                {filteredGroups.length === 0 ? (
                  <div className="initialize-card__empty">
                    No workflows found
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.title}>
                      <h4 className="initialize-card__group-title">
                        {group.title}
                      </h4>
                      <div className="initialize-card__group-list">
                        {group.workflows.map((workflow) => (
                          <button
                            key={workflow.id}
                            type="button"
                            className={cn(
                              "initialize-card__workflow",
                              selectedWorkflowId === workflow.id &&
                                "initialize-card__workflow--selected"
                            )}
                            onClick={() => onWorkflowSelect(workflow.id)}
                          >
                            <span className="initialize-card__workflow-name">
                              {workflow.name}
                            </span>
                            {workflow.description && (
                              <span className="initialize-card__workflow-desc">
                                {workflow.description}
                              </span>
                            )}
                            <span className="initialize-card__workflow-steps">
                              {workflow.stepCount} steps
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedWorkflowId && inputSchema.length > 0 && (
                <>
                  <div className="initialize-card__divider" />
                  <div className="initialize-card__inputs">
                    <h4 className="initialize-card__inputs-title">
                      Global Inputs
                    </h4>
                    <SchemaForm
                      schema={inputSchema}
                      values={inputValues}
                      onChange={onInputChange}
                      errors={inputErrors}
                    />
                  </div>
                </>
              )}

              <div className="initialize-card__actions">
                <Button
                  variant="primary"
                  onClick={onStartWorkflow}
                  disabled={isStartDisabled || !selectedWorkflowId}
                >
                  Start Workflow
                </Button>
              </div>
            </>
          ) : (
            // During session: show inputs as read-only
            inputSchema.length > 0 && (
              <div className="initialize-card__inputs">
                <h4 className="initialize-card__inputs-title">
                  Global Inputs
                </h4>
                <SchemaForm
                  schema={inputSchema}
                  values={inputValues}
                  onChange={onInputChange}
                  errors={inputErrors}
                  readOnly
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export type { InitializeCardProps as Props };
