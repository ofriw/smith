import { useEffect, useCallback } from "react";
import type { ExecutionMode } from "../contexts/SessionContext.tsx";

export type KeyboardShortcutHandlers = {
  onPause?: () => void;
  onContinue?: () => void;
  onCloseModal?: () => void;
  onSetExecutionMode?: (mode: ExecutionMode) => void;
};

export type KeyboardShortcutOptions = {
  enabled?: boolean;
  isRunning?: boolean;
  isPaused?: boolean;
  hasOpenModal?: boolean;
};

const executionModeMap: Record<string, ExecutionMode> = {
  "1": "steps-only",
  "2": "continuous",
};

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: KeyboardShortcutOptions = {},
) {
  const { enabled = true, isRunning = false, isPaused = false, hasOpenModal = false } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle if disabled or if user is typing in an input
      if (!enabled) return;
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Escape - close modal
      if (event.key === "Escape" && hasOpenModal && handlers.onCloseModal) {
        event.preventDefault();
        handlers.onCloseModal();
        return;
      }

      // Space - pause/continue
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        if (isRunning && !isPaused && handlers.onPause) {
          handlers.onPause();
        } else if (isPaused && handlers.onContinue) {
          handlers.onContinue();
        }
        return;
      }

      // 1/2/3 - switch execution mode
      const mode = executionModeMap[event.key];
      if (mode && handlers.onSetExecutionMode) {
        event.preventDefault();
        handlers.onSetExecutionMode(mode);
        return;
      }
    },
    [enabled, isRunning, isPaused, hasOpenModal, handlers],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
