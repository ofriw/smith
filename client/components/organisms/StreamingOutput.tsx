import React, { useRef, useEffect, useState } from "react";
import { cn } from "../../utils/index.ts";

export type StreamingOutputProps = {
  content: string;
  autoScroll?: boolean;
  className?: string;
};

export function StreamingOutput({
  content,
  autoScroll = true,
  className = "",
}: StreamingOutputProps) {
  const containerRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, autoScroll]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const classNames = cn("streaming-output", className);

  // Process escaped newlines to actual newlines
  const processedContent = content ? content.replace(/\\n/g, "\n") : "";

  return (
    <div className={classNames}>
      <div className="streaming-output__header">
        <span className="streaming-output__title">Output</span>
        <button
          className="streaming-output__copy"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <pre ref={containerRef} className="streaming-output__content">
        {processedContent || (
          <span className="streaming-output__empty">Waiting for output...</span>
        )}
      </pre>
    </div>
  );
}
