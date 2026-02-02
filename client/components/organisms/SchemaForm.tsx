import React from "react";
import { TextInput, TextArea, Select, Toggle } from "../atoms/index.ts";
import { FormField } from "../molecules/index.ts";
import { cn } from "../../utils/index.ts";

// Extended schema type that supports more field types
export type SchemaFieldType =
  | "string"
  | "text"
  | "number"
  | "boolean"
  | "array"
  | "select";

export type SchemaField = {
  name: string;
  label: string;
  type: SchemaFieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
};

export type SchemaFormProps = {
  schema: SchemaField[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
  className?: string;
};

export function SchemaForm({
  schema,
  values,
  onChange,
  errors = {},
  readOnly = false,
  className = "",
}: SchemaFormProps) {
  const classNames = cn("schema-form", className);

  const renderField = (field: SchemaField) => {
    const value = values[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case "string":
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            hint={field.hint}
            error={error}
          >
            <TextInput
              value={String(value ?? "")}
              onChange={(v) => onChange(field.name, v)}
              placeholder={field.placeholder}
              disabled={readOnly}
              error={!!error}
            />
          </FormField>
        );

      case "text":
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            hint={field.hint}
            error={error}
          >
            <TextArea
              value={String(value ?? "")}
              onChange={(v) => onChange(field.name, v)}
              placeholder={field.placeholder}
              disabled={readOnly}
              rows={4}
            />
          </FormField>
        );

      case "number":
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            hint={field.hint}
            error={error}
          >
            <TextInput
              value={value !== undefined ? String(value) : ""}
              onChange={(v) => {
                const num = parseFloat(v);
                onChange(field.name, isNaN(num) ? v : num);
              }}
              placeholder={field.placeholder}
              disabled={readOnly}
              error={!!error}
            />
          </FormField>
        );

      case "boolean":
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            hint={field.hint}
            error={error}
          >
            <Toggle
              checked={Boolean(value)}
              onChange={(v) => onChange(field.name, v)}
              disabled={readOnly}
            />
          </FormField>
        );

      case "select":
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            hint={field.hint}
            error={error}
          >
            <Select
              value={String(value ?? "")}
              onChange={(v) => onChange(field.name, v)}
              options={field.options ?? []}
              placeholder={field.placeholder}
              disabled={readOnly}
            />
          </FormField>
        );

      case "array":
        // For arrays, render as comma-separated values in a text input
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            hint={field.hint || "Enter values separated by commas"}
            error={error}
          >
            <TextInput
              value={
                Array.isArray(value)
                  ? value.join(", ")
                  : String(value ?? "")
              }
              onChange={(v) => {
                const arr = v
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                onChange(field.name, arr);
              }}
              placeholder={field.placeholder}
              disabled={readOnly}
              error={!!error}
            />
          </FormField>
        );

      default:
        return null;
    }
  };

  return (
    <div className={classNames}>
      {schema.map((field) => renderField(field))}
    </div>
  );
}
