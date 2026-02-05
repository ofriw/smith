import React, { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog.tsx";
import { cn } from "../../utils/index.ts";

export type SessionStatus = "idle" | "running" | "paused" | "completed" | "error";

export type StatusBarProps = {
  sessionStatus: SessionStatus;
  currentStep?: number;
  totalSteps?: number;
  workflowName?: string;
  onPause?: () => void;
  onContinue?: () => void;
  onEndSession?: () => void;
  className?: string;
};

export function StatusBar({
  sessionStatus,
  currentStep,
  totalSteps,
  workflowName,
  onPause,
  onContinue,
  onEndSession,
  className = "",
}: StatusBarProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const isSessionActive = sessionStatus !== "idle";
  const isRunning = sessionStatus === "running";
  const isPaused = sessionStatus === "paused";

  const handleEndClick = () => {
    setShowEndConfirm(true);
  };

  const handleEndConfirm = () => {
    setShowEndConfirm(false);
    onEndSession?.();
  };

  return (
    <>
      <div className={cn("status-bar", className)}>
        <div className="status-bar__left">
          {isSessionActive && (
            <div className="status-bar__indicator">
              <span
                className={cn(
                  "status-bar__dot",
                  sessionStatus === "running" && "status-bar__dot--running",
                  sessionStatus === "paused" && "status-bar__dot--paused",
                  sessionStatus === "completed" && "status-bar__dot--completed",
                  sessionStatus === "error" && "status-bar__dot--error"
                )}
              />
              <span>{workflowName || "Session"}</span>
            </div>
          )}
          {!isSessionActive && <span>Ready</span>}
        </div>

        <div className="status-bar__center">
          {isSessionActive && currentStep !== undefined && totalSteps !== undefined && (
            <div className="status-bar__progress">
              <span className="status-bar__progress-text">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
          )}
        </div>

        <div className="status-bar__right">
          {isRunning && onPause && (
            <>
              <button className="status-bar__button" onClick={onPause}>
                <span className="status-bar__button-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </span>
                Pause
              </button>
              <span className="status-bar__hint">
                <span className="status-bar__kbd">Esc</span>
              </span>
            </>
          )}

          {isPaused && onContinue && (
            <button className="status-bar__button status-bar__button--primary" onClick={onContinue}>
              <span className="status-bar__button-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              Continue
            </button>
          )}

          {isSessionActive && onEndSession && (
            <button className="status-bar__button status-bar__button--danger" onClick={handleEndClick}>
              End
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showEndConfirm}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleEndConfirm}
        title="End Session"
        message="Are you sure you want to end this session?"
        warning="Any unsaved progress will be lost."
        confirmLabel="End Session"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
}
