import React from "react";

export type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

export type RadioGroupProps = {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name: string;
  variant?: "pill" | "list";
  disabled?: boolean;
  className?: string;
};

export function RadioGroup({
  value,
  onChange,
  options,
  name,
  variant = "list",
  disabled = false,
  className = "",
}: RadioGroupProps) {
  const classNames = [
    "radio-group",
    `radio-group--${variant}`,
    disabled && "radio-group--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames} role="radiogroup">
      {options.map((option) => {
        const isSelected = option.value === value;
        const optionClassName = [
          "radio-group__option",
          isSelected && "radio-group__option--selected",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <label key={option.value} className={optionClassName}>
            <input
              type="radio"
              className="radio-group__input"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={disabled}
            />
            <span className="radio-group__indicator" />
            <span className="radio-group__content">
              <span className="radio-group__label">{option.label}</span>
              {option.description && variant === "list" && (
                <span className="radio-group__description">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
