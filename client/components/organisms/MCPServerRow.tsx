import React, { useState } from "react";
import { StatusBadge, IconButton } from "../atoms/index.ts";

export type MCPServerStatus = "running" | "stopped" | "error";

export type MCPServerRowProps = {
  name: string;
  status: MCPServerStatus;
  config?: Record<string, string>;
};

const statusMap: Record<MCPServerStatus, "available" | "unavailable" | "error"> = {
  running: "available",
  stopped: "unavailable",
  error: "error",
};

export function MCPServerRow({ name, status, config }: MCPServerRowProps) {
  const [expanded, setExpanded] = useState(false);

  const hasConfig = config && Object.keys(config).length > 0;

  const className = ["mcp-server-row", expanded && "mcp-server-row--expanded"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <div
        className="mcp-server-row__header"
        onClick={() => hasConfig && setExpanded(!expanded)}
        role={hasConfig ? "button" : undefined}
        tabIndex={hasConfig ? 0 : undefined}
        aria-expanded={hasConfig ? expanded : undefined}
        onKeyDown={(e) => {
          if (hasConfig && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <span className="mcp-server-row__name">{name}</span>
        <StatusBadge status={statusMap[status]} size="sm" />

        {hasConfig && (
          <span className="mcp-server-row__expand">
            <IconButton
              icon="expand"
              size="sm"
              variant="ghost"
              label={expanded ? "Collapse config" : "Expand config"}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            />
          </span>
        )}
      </div>

      {hasConfig && expanded && (
        <div className="mcp-server-row__config">
          <div className="mcp-server-row__config-title">Configuration</div>
          <div className="mcp-server-row__config-list">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="mcp-server-row__config-item">
                <span className="mcp-server-row__config-key">{key}</span>
                <span className="mcp-server-row__config-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
