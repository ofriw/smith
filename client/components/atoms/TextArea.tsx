import React, { forwardRef } from "react";

export type TextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  rows?: number;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  className?: string;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      value,
      onChange,
      placeholder,
      disabled = false,
      error = false,
      rows = 4,
      name,
      id,
      autoFocus,
      className = "",
    },
    ref
  ) {
    const classNames = [
      "text-area",
      error && "text-area--error",
      disabled && "text-area--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        ref={ref}
        className={classNames}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        name={name}
        id={id}
        autoFocus={autoFocus}
        aria-invalid={error}
      />
    );
  }
);
