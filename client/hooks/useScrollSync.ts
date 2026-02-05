import type { RefObject } from "react";
import { useEffect, useRef, useCallback, useState } from "react";

const BOTTOM_THRESHOLD_PX = 50;
const SMOOTH_SCROLL_TIMEOUT_MS = 400;
const INSTANT_SCROLL_TIMEOUT_MS = 50;

export type UseScrollSyncReturn = {
  containerRef: RefObject<HTMLDivElement>;
  registerStepRef: (index: number, el: HTMLElement | null) => void;
  scrollToStep: (index: number) => void;
  scrollToBottom: () => void;
  isUserScrolled: boolean;
  resetUserScroll: () => void;
};

function prefersReducedMotion(): boolean {
  return globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function isNearBottom(container: HTMLElement): boolean {
  const { scrollTop, scrollHeight, clientHeight } = container;
  return scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD_PX;
}

export function useScrollSync(): UseScrollSyncReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Map<number, HTMLElement>>(new Map());
  const isProgrammaticScrollRef = useRef(false);
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUserScrolled, setIsUserScrolled] = useState(false);

  const registerStepRef = useCallback((index: number, element: HTMLElement | null) => {
    if (element) {
      stepRefs.current.set(index, element);
    } else {
      stepRefs.current.delete(index);
    }
  }, []);

  const clearScrollEndTimeout = useCallback(() => {
    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
      scrollEndTimeoutRef.current = null;
    }
  }, []);

  const markProgrammaticScrollComplete = useCallback(() => {
    isProgrammaticScrollRef.current = false;
    clearScrollEndTimeout();
  }, [clearScrollEndTimeout]);

  const performScroll = useCallback((scrollFn: () => void) => {
    const container = containerRef.current;
    if (!container) return;

    isProgrammaticScrollRef.current = true;
    clearScrollEndTimeout();

    const useSmooth = !prefersReducedMotion();
    const timeoutMs = useSmooth ? SMOOTH_SCROLL_TIMEOUT_MS : INSTANT_SCROLL_TIMEOUT_MS;

    // Try scrollend event first (Baseline 2025), fallback to timeout
    const handleScrollEnd = () => {
      markProgrammaticScrollComplete();
      container.removeEventListener("scrollend", handleScrollEnd);
    };

    if ("onscrollend" in container) {
      container.addEventListener("scrollend", handleScrollEnd, { once: true });
      // Fallback timeout in case scrollend doesn't fire
      scrollEndTimeoutRef.current = setTimeout(() => {
        container.removeEventListener("scrollend", handleScrollEnd);
        markProgrammaticScrollComplete();
      }, timeoutMs + 100);
    } else {
      // Browser doesn't support scrollend, use timeout only
      scrollEndTimeoutRef.current = setTimeout(markProgrammaticScrollComplete, timeoutMs);
    }

    scrollFn();
  }, [clearScrollEndTimeout, markProgrammaticScrollComplete]);

  const scrollToStep = useCallback((index: number) => {
    const element = stepRefs.current.get(index);
    const container = containerRef.current;
    if (!element || !container) return;

    performScroll(() => {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const targetScrollTop = container.scrollTop + elementRect.top - containerRect.top;
      const behavior = prefersReducedMotion() ? "instant" : "smooth";

      container.scrollTo({
        top: targetScrollTop,
        behavior,
      });
    });
  }, [performScroll]);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    performScroll(() => {
      const behavior = prefersReducedMotion() ? "instant" : "smooth";
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    });
  }, [performScroll]);

  const resetUserScroll = useCallback(() => {
    setIsUserScrolled(false);
  }, []);

  // Track user scroll - only when not a programmatic scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      // User scrolled - check if they scrolled away from bottom
      if (!isNearBottom(container)) {
        setIsUserScrolled(true);
      } else {
        // User scrolled back to bottom manually
        setIsUserScrolled(false);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearScrollEndTimeout();
    };
  }, [clearScrollEndTimeout]);

  return {
    containerRef,
    registerStepRef,
    scrollToStep,
    scrollToBottom,
    isUserScrolled,
    resetUserScroll,
  };
}
