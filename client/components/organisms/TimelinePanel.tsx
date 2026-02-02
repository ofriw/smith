import React, { useState, useMemo } from "react";
import { ToolCallEntry } from "../molecules/index.ts";
import { SearchInput } from "../molecules/index.ts";
import { Select } from "../atoms/index.ts";
import type { ToolCallEntryProps } from "../molecules/index.ts";

export type TimelineCall = ToolCallEntryProps & {
  id: string;
  stepName?: string;
};

export type StatusFilter = "all" | "running" | "done" | "error";

export type TimelinePanelProps = {
  calls: TimelineCall[];
  onRevert: (callId: string) => void;
  groupByStep?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterStatus?: StatusFilter;
  onFilterStatusChange?: (status: StatusFilter) => void;
};

const statusFilterOptions = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "done", label: "Done" },
  { value: "error", label: "Error" },
];

export function TimelinePanel({
  calls,
  onRevert,
  groupByStep = false,
  searchQuery: externalSearchQuery,
  onSearchChange,
  filterStatus: externalFilterStatus,
  onFilterStatusChange,
}: TimelinePanelProps) {
  // Internal state for uncontrolled mode
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalFilterStatus, setInternalFilterStatus] =
    useState<StatusFilter>("all");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Use external or internal state
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const filterStatus = externalFilterStatus ?? internalFilterStatus;

  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      setInternalSearchQuery(query);
    }
  };

  const handleFilterChange = (status: string) => {
    const newStatus = status as StatusFilter;
    if (onFilterStatusChange) {
      onFilterStatusChange(newStatus);
    } else {
      setInternalFilterStatus(newStatus);
    }
  };

  const toggleGroup = (stepName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(stepName)) {
        next.delete(stepName);
      } else {
        next.add(stepName);
      }
      return next;
    });
  };

  // Filter calls based on search and status
  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Status filter
      if (filterStatus !== "all" && call.status !== filterStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesToolName = call.toolName.toLowerCase().includes(query);
        const matchesDescription =
          call.description?.toLowerCase().includes(query) ?? false;
        if (!matchesToolName && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }, [calls, filterStatus, searchQuery]);

  // Group calls by step if enabled
  const groupedCalls = useMemo(() => {
    if (!groupByStep) {
      return null;
    }

    const groups = new Map<string, TimelineCall[]>();
    for (const call of filteredCalls) {
      const stepName = call.stepName || "Ungrouped";
      if (!groups.has(stepName)) {
        groups.set(stepName, []);
      }
      groups.get(stepName)!.push(call);
    }
    return groups;
  }, [filteredCalls, groupByStep]);

  const renderCall = (call: TimelineCall) => (
    <ToolCallEntry
      key={call.id}
      toolName={call.toolName}
      status={call.status}
      description={call.description}
      input={call.input}
      output={call.output}
      timing={call.timing}
      tokens={call.tokens}
      filePaths={call.filePaths}
      onRevert={() => onRevert(call.id)}
      reverted={call.reverted}
      expandable={call.expandable}
    />
  );

  return (
    <div className="timeline-panel">
      <div className="timeline-panel__header">
        <span className="timeline-panel__title">
          Tool Calls
          <span className="timeline-panel__count">
            ({filteredCalls.length}
            {filteredCalls.length !== calls.length && ` of ${calls.length}`})
          </span>
        </span>
      </div>

      <div className="timeline-panel__filters">
        <div className="timeline-panel__search">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search tools..."
          />
        </div>
        <div className="timeline-panel__status-filter">
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            options={statusFilterOptions}
          />
        </div>
      </div>

      <div className="timeline-panel__content">
        {filteredCalls.length === 0 ? (
          <div className="timeline-panel__empty">
            {calls.length === 0 ? "No tool calls yet" : "No matches found"}
          </div>
        ) : groupedCalls ? (
          // Grouped view
          <div className="timeline-panel__groups">
            {Array.from(groupedCalls.entries()).map(([stepName, stepCalls]) => {
              const isCollapsed = collapsedGroups.has(stepName);
              return (
                <div key={stepName} className="timeline-panel__group">
                  <button
                    className="timeline-panel__group-header"
                    onClick={() => toggleGroup(stepName)}
                    aria-expanded={!isCollapsed}
                  >
                    <span className="timeline-panel__group-toggle">
                      {isCollapsed ? "▸" : "▾"}
                    </span>
                    <span className="timeline-panel__group-name">
                      {stepName}
                    </span>
                    <span className="timeline-panel__group-count">
                      ({stepCalls.length})
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="timeline-panel__group-content">
                      {stepCalls.map(renderCall)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Flat list view
          <div className="timeline-panel__list">
            {filteredCalls.map(renderCall)}
          </div>
        )}
      </div>
    </div>
  );
}
