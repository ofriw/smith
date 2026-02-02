import React from "react";
import { IconButton } from "../atoms/index.ts";

export type Tab = {
  id: string;
  label: string;
  status: "active" | "running" | "error" | "done";
};

export type TabBarProps = {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
};

export function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onNewTab,
}: TabBarProps) {
  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      onTabClose(tabId);
    }
  };

  return (
    <div className="tab-bar" role="tablist">
      <div className="tab-bar__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === activeTabId}
            className={[
              "tab-bar__tab",
              tab.id === activeTabId && "tab-bar__tab--active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onTabSelect(tab.id)}
            onMouseDown={(e) => handleMiddleClick(e, tab.id)}
          >
            {tab.status !== "active" && (
              <span className={`tab-bar__tab-status tab-bar__tab-status--${tab.status}`} />
            )}
            <span className="tab-bar__tab-label">{tab.label}</span>
            <button
              type="button"
              className="tab-bar__tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              aria-label={`Close ${tab.label}`}
            >
              ×
            </button>
          </button>
        ))}
      </div>

      <div className="tab-bar__new">
        <IconButton
          icon="add"
          variant="ghost"
          size="sm"
          label="New workflow"
          onClick={onNewTab}
        />
      </div>
    </div>
  );
}
