"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import type { ActionState } from "@/app/admin/actions";

/** Submit button that shows a pending state while the action runs. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  size = "md",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size={size} variant={variant} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  );
}

const field =
  "w-full border-b border-line bg-transparent py-2.5 text-base text-ink outline-none transition-colors placeholder:text-stone-soft focus:border-ink";
const label = "text-eyebrow uppercase text-stone";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="text-body-sm text-stone" role="alert">
      {message}
    </span>
  );
}

/** Result banner shared by every admin form. */
export function ActionMessage({ state }: { state: ActionState | null }) {
  if (!state) return null;
  return (
    <p
      role="status"
      className={
        state.ok
          ? "border border-line bg-shell px-4 py-3 text-body-sm"
          : "border border-line bg-cream/40 px-4 py-3 text-body-sm"
      }
    >
      {state.message}
    </p>
  );
}

export { field, label };