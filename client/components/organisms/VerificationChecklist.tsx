import React from "react";
import { VerificationItem, VerificationItemProps } from "../molecules/VerificationItem.tsx";
import { cn } from "../../utils/index.ts";

export type VerificationChecklistProps = {
  items: VerificationItemProps[];
  className?: string;
};

export function VerificationChecklist({
  items,
  className = "",
}: VerificationChecklistProps) {
  const passCount = items.filter((i) => i.status === "pass").length;
  const failCount = items.filter((i) => i.status === "fail").length;

  const classNames = cn("verification-checklist", className);

  return (
    <div className={classNames}>
      <div className="verification-checklist__header">
        <h3 className="verification-checklist__title">Verification</h3>
        <span className="verification-checklist__count">
          {passCount}/{items.length} passed
          {failCount > 0 && (
            <span className="verification-checklist__fail-count">
              ({failCount} failed)
            </span>
          )}
        </span>
      </div>
      <div className="verification-checklist__items">
        {items.map((item) => (
          <VerificationItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}
