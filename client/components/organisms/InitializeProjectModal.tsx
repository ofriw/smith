import React from "react";
import { Button } from "../atoms/index.ts";
import { Modal } from "./Modal.tsx";

export type InitializeProjectModalProps = {
  open: boolean;
  projectPath: string;
  onCancel: () => void;
  onInitialize: () => void;
};

const ITEMS_TO_CREATE = [
  { path: ".smith/settings.json", description: "Project configuration file" },
  { path: ".smith/workflows/", description: "Custom workflow definitions" },
  { path: ".smith/db/", description: "Local session history database" },
];

export function InitializeProjectModal({
  open,
  projectPath,
  onCancel,
  onInitialize,
}: InitializeProjectModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="INITIALIZE S.M.I.T.H"
      size="md"
      actions={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onInitialize}>
            Initialize
          </Button>
        </>
      }
    >
      <div className="initialize-modal">
        <p className="initialize-modal__description">
          This folder needs to be initialized before S.M.I.T.H can manage workflows here.
        </p>

        <div className="initialize-modal__path">
          <span className="initialize-modal__path-label">Project Path</span>
          <code className="initialize-modal__path-value">{projectPath}</code>
        </div>

        <div className="initialize-modal__checklist">
          <h3 className="initialize-modal__checklist-title">
            The following will be created:
          </h3>
          <ul className="initialize-modal__items">
            {ITEMS_TO_CREATE.map((item) => (
              <li key={item.path} className="initialize-modal__item">
                <span className="initialize-modal__item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <div className="initialize-modal__item-content">
                  <code className="initialize-modal__item-path">{item.path}</code>
                  <span className="initialize-modal__item-description">
                    {item.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="initialize-modal__note">
          <span className="initialize-modal__note-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          The <code>.smith/</code> folder will be added to your <code>.gitignore</code> if it exists.
        </p>
      </div>
    </Modal>
  );
}
