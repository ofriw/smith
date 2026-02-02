import React, { useState } from "react";
import { Button, Select, SelectOption } from "../atoms/index.ts";
import { ConfirmDialog } from "./ConfirmDialog.tsx";
import { cn } from "../../utils/index.ts";

export type ExecutionControlsProps = {
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onContinue: () => void;
  rewindOptions: SelectOption[];
  onRewind: (stepId: string) => void;
  onEndSession: () => void;
  className?: string;
};

export function ExecutionControls({
  isRunning,
  isPaused,
  onPause,
  onContinue,
  rewindOptions,
  onRewind,
  onEndSession,
  className = "",
}: ExecutionControlsProps) {
  const [rewindValue, setRewindValue] = useState("");
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);

  const handleRewindSelect = (value: string) => {
    setRewindValue(value);
    if (value) {
      onRewind(value);
      setRewindValue("");
    }
  };

  const handleEndSessionClick = () => {
    setShowEndSessionConfirm(true);
  };

  const handleEndSessionConfirm = () => {
    setShowEndSessionConfirm(false);
    onEndSession();
  };

  const classNames = cn("execution-controls", className);

  return (
    <>
      <div className={classNames}>
        <div className="execution-controls__left">
          {isRunning && !isPaused && (
            <Button variant="secondary" onClick={onPause}>
              <span className="execution-controls__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </span>
              Pause
            </Button>
          )}
          {isPaused && (
            <Button variant="primary" onClick={onContinue}>
              <span className="execution-controls__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              Continue
            </Button>
          )}
        </div>

        <div className="execution-controls__center">
          {rewindOptions.length > 0 && (
            <div className="execution-controls__rewind">
              <Select
                value={rewindValue}
                onChange={handleRewindSelect}
                options={rewindOptions}
                placeholder="Rewind to..."
              />
            </div>
          )}
        </div>

        <div className="execution-controls__right">
          <Button variant="danger" onClick={handleEndSessionClick}>
            End Session
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={showEndSessionConfirm}
        onClose={() => setShowEndSessionConfirm(false)}
        onConfirm={handleEndSessionConfirm}
        title="End Session"
        message="Are you sure you want to end this session?"
        warning="Any unsaved progress will be lost. This action cannot be undone."
        confirmLabel="End Session"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
