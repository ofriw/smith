import React, { useState } from "react";
import { Button } from "../atoms/index.ts";
import { WorkflowCard, WorkflowCardProps, SearchInput } from "../molecules/index.ts";
import { Modal } from "./Modal.tsx";
import { GlobalInputsForm, InputFieldSchema } from "./GlobalInputsForm.tsx";
import { ExecutionModeToggle, ExecutionMode } from "./ExecutionModeToggle.tsx";

export type WorkflowListGroup = {
  title: string;
  workflows: (WorkflowCardProps & { id: string })[];
};

export type WorkflowSelectionModalProps = {
  open: boolean;
  onClose: () => void;
  projectName: string;
  workflowGroups: WorkflowListGroup[];
  selectedWorkflowId?: string;
  onWorkflowSelect: (id: string) => void;
  inputSchema: InputFieldSchema[];
  inputValues: Record<string, string | string[]>;
  onInputChange: (name: string, value: string | string[]) => void;
  inputErrors?: Record<string, string>;
  executionMode: ExecutionMode;
  onExecutionModeChange: (mode: ExecutionMode) => void;
  onStartWorkflow: () => void;
  isStartDisabled?: boolean;
};

export function WorkflowSelectionModal({
  open,
  onClose,
  projectName,
  workflowGroups,
  selectedWorkflowId,
  onWorkflowSelect,
  inputSchema,
  inputValues,
  onInputChange,
  inputErrors,
  executionMode,
  onExecutionModeChange,
  onStartWorkflow,
  isStartDisabled = false,
}: WorkflowSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = workflowGroups.map(group => ({
    ...group,
    workflows: group.workflows.filter(w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(group => group.workflows.length > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="SELECT WORKFLOW"
      size="lg"
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onStartWorkflow}
            disabled={isStartDisabled || !selectedWorkflowId}
          >
            Start Workflow
          </Button>
        </>
      }
    >
      <div className="workflow-selection-modal">
        <div className="workflow-selection-modal__project">
          {projectName}
        </div>

        <div className="workflow-selection-modal__search">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search workflows..."
          />
        </div>

        <div className="workflow-selection-modal__workflows">
          {filteredGroups.map((group) => (
            <div key={group.title} className="workflow-selection-modal__group">
              <h3 className="workflow-selection-modal__group-title">
                {group.title}
              </h3>
              <div className="workflow-selection-modal__group-list">
                {group.workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={[
                      "workflow-selection-modal__workflow",
                      selectedWorkflowId === workflow.id &&
                        "workflow-selection-modal__workflow--selected",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <WorkflowCard
                      {...workflow}
                      onClick={() => onWorkflowSelect(workflow.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedWorkflowId && inputSchema.length > 0 && (
          <>
            <div className="workflow-selection-modal__divider" />

            <div className="workflow-selection-modal__inputs">
              <h3 className="workflow-selection-modal__section-title">
                GLOBAL INPUTS
              </h3>
              <GlobalInputsForm
                schema={inputSchema}
                values={inputValues}
                onChange={onInputChange}
                errors={inputErrors}
              />
            </div>
          </>
        )}

        {selectedWorkflowId && (
          <>
            <div className="workflow-selection-modal__divider" />

            <div className="workflow-selection-modal__mode">
              <h3 className="workflow-selection-modal__section-title">
                EXECUTION MODE
              </h3>
              <ExecutionModeToggle
                value={executionMode}
                onChange={onExecutionModeChange}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
