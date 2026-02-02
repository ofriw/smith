import React from "react";
import { TextInput, TextArea } from "../atoms/index.ts";
import { FormField } from "../molecules/index.ts";
import { cn } from "../../utils/index.ts";

export type InputFieldSchema = {
  name: string;
  label: string;
  type: "string" | "text" | "array";
  required?: boolean;
  placeholder?: string;
  hint?: string;
};

export type GlobalInputsFormProps = {
  schema: InputFieldSchema[];
  values: Record<string, string | string[]>;
  onChange: (name: string, value: string | string[]) => void;
  errors?: Record<string, string>;
  className?: string;
};

export function GlobalInputsForm({
  schema,
  values,
  onChange,
  errors = {},
  className = "",
}: GlobalInputsFormProps) {
  const classNames = cn("global-inputs-form", className);

  const renderField = (field: InputFieldSchema) => {
    const value = values[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case "text":
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={error}
            hint={field.hint}
            htmlFor={`input-${field.name}`}
          >
            <TextArea
              id={`input-${field.name}`}
              value={(value as string) || ""}
              onChange={(val) => onChange(field.name, val)}
              placeholder={field.placeholder}
              error={!!error}
              rows={4}
            />
          </FormField>
        );

      case "array":
        const arrayValue = Array.isArray(value) ? value : [];
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={error}
            hint={field.hint || "Enter one item per line"}
            htmlFor={`input-${field.name}`}
          >
            <TextArea
              id={`input-${field.name}`}
              value={arrayValue.join("\n")}
              onChange={(val) => onChange(field.name, val.split("\n").filter(Boolean))}
              placeholder={field.placeholder}
              error={!!error}
              rows={3}
            />
          </FormField>
        );

      case "string":
      default:
        return (
          <FormField
            key={field.name}
            label={field.label}
            required={field.required}
            error={error}
            hint={field.hint}
            htmlFor={`input-${field.name}`}
          >
            <TextInput
              id={`input-${field.name}`}
              value={(value as string) || ""}
              onChange={(val) => onChange(field.name, val)}
              placeholder={field.placeholder}
              error={!!error}
            />
          </FormField>
        );
    }
  };

  return <div className={classNames}>{schema.map(renderField)}</div>;
}
