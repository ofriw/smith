import React from "react";
import { Button, Select, SelectOption } from "../atoms/index.ts";
import { cn } from "../../utils/index.ts";

export type RecoveryActionsProps = {
  onRetry: () => void;
  revertOptions: SelectOption[];
  onRevert: (toolCallId: string) => void;
  rewindOptions: SelectOption[];
  onRewind: (stepId: string) => void;
  onEditFork: () => void;
  onEndSession: () => void;
  className?: string;
};

export function RecoveryActions({
  onRetry,
  revertOptions,
  onRevert,
  rewindOptions,
  onRewind,
  onEditFork,
  onEndSession,
  className = "",
}: RecoveryActionsProps) {
  const classNames = cn("recovery-actions", className);

  const handleRevertSelect = (value: string) => {
    if (value) onRevert(value);
  };

  const handleRewindSelect = (value: string) => {
    if (value) onRewind(value);
  };

  return (
    <div className={classNames}>
      <div className="recovery-actions__row">
        <Button variant="primary" onClick={onRetry}>
          Retry
        </Button>

        {revertOptions.length > 0 && (
          <Select
            value=""
            onChange={handleRevertSelect}
            options={revertOptions}
            placeholder="Revert File Changes..."
          />
        )}

        {rewindOptions.length > 0 && (
          <Select
            value=""
            onChange={handleRewindSelect}
            options={rewindOptions}
            placeholder="Rewind to..."
          />
        )}
      </div>

      <div className="recovery-actions__row">
        <Button variant="secondary" onClick={onEditFork}>
          Edit & Fork
        </Button>

        <Button variant="danger" onClick={onEndSession}>
          End Session
        </Button>
      </div>
    </div>
  );
}
