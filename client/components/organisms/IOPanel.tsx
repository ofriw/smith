import React, { useState } from "react";
import { IconButton } from "../atoms/index.ts";
import { cn } from "../../utils/index.ts";
import { SchemaForm } from "./SchemaForm.tsx";
import type { SchemaField } from "./SchemaForm.tsx";

export type IOPanelProps = {
  title: string;
  data: Record<string, unknown>;
  schema?: SchemaField[];
  editable?: boolean;
  onChange?: (data: Record<string, unknown>) => void;
  validationErrors?: Record<string, string>;
  collapsed?: boolean;
};

const STRING_TRUNCATE_LENGTH = 100;

const ChevronIcon = ({ expanded }: { expanded?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="12"
    height="12"
    style={{ transform: expanded ? "rotate(90deg)" : undefined, transition: "transform 0.15s" }}
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

function getValueType(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return "unknown";
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "undefined") return "undefined";
  return String(value);
}

function getSummary(data: Record<string, unknown>): string {
  const keys = Object.keys(data);
  if (keys.length === 0) return "Empty object";
  if (keys.length <= 3) return keys.join(", ");
  return `${keys.slice(0, 3).join(", ")} +${keys.length - 3} more`;
}

export function IOPanel({
  title,
  data,
  schema,
  editable = false,
  onChange,
  validationErrors = {},
  collapsed: initialCollapsed = false,
}: IOPanelProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [expandedStrings, setExpandedStrings] = useState<Set<string>>(new Set());

  const togglePath = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const toggleString = (path: string) => {
    setExpandedStrings((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const className = cn(
    "io-panel",
    collapsed && "io-panel--collapsed",
    editable && "io-panel--editable",
  );

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  const handleEdit = () => {
    setEditValue(JSON.stringify(data, null, 2));
    setJsonError(null);
    setEditing(true);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(editValue);
      onChange?.(parsed);
      setJsonError(null);
      setEditing(false);
    } catch (e) {
      setJsonError(e instanceof SyntaxError ? e.message : "Invalid JSON");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditValue("");
    setJsonError(null);
  };

  const renderValue = (key: string, value: unknown, path: string, indent = 0): React.ReactNode => {
    const valueType = getValueType(value);
    const padding = "  ".repeat(indent);
    const isExpanded = expandedPaths.has(path);

    if (valueType === "object" && value !== null) {
      const entries = Object.entries(value as Record<string, unknown>);
      const keyCount = entries.length;

      if (!isExpanded) {
        return (
          <div className="io-panel__field io-panel__field--collapsed" key={path}>
            <button className="io-panel__expand-toggle" onClick={() => togglePath(path)}>
              <ChevronIcon expanded={false} />
            </button>
            <span className="io-panel__field-key">{padding}{key}</span>:{" "}
            <span className="io-panel__collapsed-preview">{`{${keyCount} keys}`}</span>
          </div>
        );
      }

      return (
        <div className="io-panel__field" key={path}>
          <button className="io-panel__expand-toggle io-panel__expand-toggle--expanded" onClick={() => togglePath(path)}>
            <ChevronIcon expanded={true} />
          </button>
          <span className="io-panel__field-key">{padding}{key}</span>: {"{"}
          {entries.map(([k, v]) => renderValue(k, v, `${path}.${k}`, indent + 1))}
          {padding}{"}"}
        </div>
      );
    }

    if (valueType === "array") {
      const arr = value as unknown[];

      if (!isExpanded) {
        return (
          <div className="io-panel__field io-panel__field--collapsed" key={path}>
            <button className="io-panel__expand-toggle" onClick={() => togglePath(path)}>
              <ChevronIcon expanded={false} />
            </button>
            <span className="io-panel__field-key">{padding}{key}</span>:{" "}
            <span className="io-panel__collapsed-preview">{`[${arr.length} items]`}</span>
          </div>
        );
      }

      return (
        <div className="io-panel__field" key={path}>
          <button className="io-panel__expand-toggle io-panel__expand-toggle--expanded" onClick={() => togglePath(path)}>
            <ChevronIcon expanded={true} />
          </button>
          <span className="io-panel__field-key">{padding}{key}</span>: [
          {arr.map((item, i) => {
            const itemType = getValueType(item);
            if (itemType === "object" || itemType === "array") {
              return renderValue(String(i), item, `${path}[${i}]`, indent + 1);
            }
            return (
              <span key={i} className={`io-panel__field-value io-panel__field-value--${itemType}`}>
                {formatValue(item)}{i < arr.length - 1 ? ", " : ""}
              </span>
            );
          })}
          ]
        </div>
      );
    }

    // Handle long string truncation
    if (valueType === "string") {
      const str = value as string;
      const isLongString = str.length > STRING_TRUNCATE_LENGTH;
      const isStringExpanded = expandedStrings.has(path);

      if (isLongString && !isStringExpanded) {
        const truncated = str.slice(0, STRING_TRUNCATE_LENGTH);
        return (
          <div className="io-panel__field" key={path}>
            <span className="io-panel__field-key">{padding}{key}</span>:{" "}
            <span className="io-panel__field-value io-panel__field-value--string">
              "{truncated}..."
            </span>
            <button className="io-panel__show-more" onClick={() => toggleString(path)}>
              Show more
            </button>
          </div>
        );
      }

      if (isLongString && isStringExpanded) {
        return (
          <div className="io-panel__field" key={path}>
            <span className="io-panel__field-key">{padding}{key}</span>:{" "}
            <span className="io-panel__field-value io-panel__field-value--string">
              "{str}"
            </span>
            <button className="io-panel__show-more" onClick={() => toggleString(path)}>
              Show less
            </button>
          </div>
        );
      }
    }

    return (
      <div className="io-panel__field" key={path}>
        <span className="io-panel__field-key">{padding}{key}</span>:{" "}
        <span className={`io-panel__field-value io-panel__field-value--${valueType}`}>
          {formatValue(value)}
        </span>
      </div>
    );
  };

  return (
    <div className={className}>
      <div
        className="io-panel__header"
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <span className="io-panel__title">{title}</span>
        <span className="io-panel__toggle">
          <IconButton
            icon="expand"
            size="sm"
            variant="ghost"
            label={collapsed ? "Expand" : "Collapse"}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          />
        </span>
      </div>

      <div className="io-panel__body">
        {collapsed ? (
          <p className="io-panel__summary">{getSummary(data)}</p>
        ) : schema && editable ? (
          // Schema-driven form mode
          <div className="io-panel__content io-panel__content--form">
            <SchemaForm
              schema={schema}
              values={data}
              onChange={(name, value) => {
                onChange?.({ ...data, [name]: value });
              }}
              errors={validationErrors}
              readOnly={!editable}
            />
          </div>
        ) : editing ? (
          // Raw JSON editing mode
          <>
            <textarea
              className={cn("io-panel__content", jsonError && "io-panel__content--error")}
              value={editValue}
              onChange={(e) => {
                setEditValue(e.target.value);
                setJsonError(null);
              }}
              style={{ minHeight: "200px", width: "100%", resize: "vertical" }}
            />
            {jsonError && (
              <p className="io-panel__error">{jsonError}</p>
            )}
            <div className="io-panel__edit-actions">
              <button
                type="button"
                className="io-panel__edit-btn io-panel__edit-btn--secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="io-panel__edit-btn io-panel__edit-btn--primary"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          // Read-only JSON view mode
          <>
            <div className="io-panel__content">
              {Object.entries(data).map(([key, value]) =>
                renderValue(key, value, key)
              )}
            </div>
            {editable && !schema && (
              <div className="io-panel__edit-actions">
                <button
                  type="button"
                  className="io-panel__edit-btn io-panel__edit-btn--secondary"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
