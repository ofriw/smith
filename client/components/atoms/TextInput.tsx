import React, { forwardRef } from "react";

export type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  type?: "text" | "email" | "password" | "url" | "search";
  name?: string;
  id?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      value,
      onChange,
      placeholder,
      disabled = false,
      error = false,
      icon,
      type = "text",
      name,
      id,
      autoComplete,
      autoFocus,
      className = "",
    },
    ref
  ) {
    const classNames = [
      "text-input",
      icon && "text-input--with-icon",
      error && "text-input--error",
      disabled && "text-input--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={classNames}>
        {icon && <span className="text-input__icon">{icon}</span>}
        <input
          ref={ref}
          type={type}
          className="text-input__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          name={name}
          id={id}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={error}
        />
      </div>
    );
  }
);
