import React from "react";

export type FormFieldProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  className?: string;
};

export function FormField({
  label,
  children,
  error,
  required = false,
  htmlFor,
  hint,
  className = "",
}: FormFieldProps) {
  const classNames = ["form-field", error && "form-field--error", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      {hint && <p className="form-field__hint">{hint}</p>}
      <div className="form-field__input">{children}</div>
      {error && (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
