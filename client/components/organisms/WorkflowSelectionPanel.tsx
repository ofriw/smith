import React, { useState } from "react";
import { Button } from "../atoms/index.ts";
import { SearchInput } from "../molecules/index.ts";
import { SchemaForm, SchemaField } from "./SchemaForm.tsx";

export type WorkflowListItem = {
  id: string;
  name: string;
  description?: string;
  stepCount: number;
};

export type WorkflowListGroup = {
  title: string;
  workflows: WorkflowListItem[];
};

export type WorkflowSelectionPanelProps = {
  projectName: string;
  workflowGroups: WorkflowListGroup[];
  selectedWorkflowId?: string;
  onWorkflowSelect: (id: string) => void;
  inputSchema: SchemaField[];
  inputValues: Record<string, unknown>;
  onInputChange: (name: string, value: unknown) => void;
  inputErrors?: Record<string, string>;
  onStartWorkflow: () => void;
  isStartDisabled?: boolean;
};

export function WorkflowSelectionPanel({
  projectName,
  workflowGroups,
  selectedWorkflowId,
  onWorkflowSelect,
  inputSchema,
  inputValues,
  onInputChange,
  inputErrors,
  onStartWorkflow,
  isStartDisabled = false,
}: WorkflowSelectionPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="workflow-selection-panel">
      <div className="workflow-selection-panel__header">
        <h2 className="workflow-selection-panel__title">SELECT WORKFLOW</h2>
        <div className="workflow-selection-panel__project">{projectName}</div>
      </div>

      <div className="workflow-selection-panel__search">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search workflows..."
        />
      </div>

      <div className="workflow-selection-panel__workflows">
        {filteredGroups.map((group) => (
          <div key={group.title} className="workflow-selection-panel__group">
            <h3 className="workflow-selection-panel__group-title">
              {group.title}
            </h3>
            <div className="workflow-selection-panel__group-list">
              {group.workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  type="button"
                  className={[
                    "workflow-selection-panel__workflow",
                    selectedWorkflowId === workflow.id &&
                      "workflow-selection-panel__workflow--selected",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onWorkflowSelect(workflow.id)}
                >
                  <span className="workflow-selection-panel__workflow-name">
                    {workflow.name}
                  </span>
                  {workflow.description && (
                    <span className="workflow-selection-panel__workflow-desc">
                      {workflow.description}
                    </span>
                  )}
                  <span className="workflow-selection-panel__workflow-steps">
                    {workflow.stepCount} steps
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedWorkflowId && inputSchema.length > 0 && (
        <>
          <div className="workflow-selection-panel__divider" />

          <div className="workflow-selection-panel__inputs">
            <h3 className="workflow-selection-panel__section-title">
              GLOBAL INPUTS
            </h3>
            <SchemaForm
              schema={inputSchema}
              values={inputValues}
              onChange={onInputChange}
              errors={inputErrors}
            />
          </div>
        </>
      )}

      <div className="workflow-selection-panel__actions">
        <Button
          variant="primary"
          onClick={onStartWorkflow}
          disabled={isStartDisabled || !selectedWorkflowId}
        >
          Start Workflow
        </Button>
      </div>
    </div>
  );
}
