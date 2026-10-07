"use client";

import { useActionState } from "react";
import { createCouponAction } from "@/app/admin/actions";
import {
  ActionMessage,
  FieldError,
  SubmitButton,
  field,
  label,
} from "@/components/admin/Form";

/**
 * New discount code form. Codes are percent-off only, validated server-side
 * in the action and again by the checkout service when a buyer uses one.
 */
export function CouponForm() {
  const [state, action] = useActionState(createCouponAction, null);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-6 border border-line bg-shell p-6">
      <p className="text-eyebrow uppercase text-stone">New code</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className={label}>Code *</span>
          <input
            name="code"
            required
            maxLength={40}
            placeholder="WELCOME10"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            className={field}
          />
          <FieldError message={errors.code} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Percent off *</span>
          <input
            name="percentOff"
            required
            inputMode="numeric"
            placeholder="10"
            className={field}
          />
          <FieldError message={errors.percentOff} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Max redemptions</span>
          <input
            name="maxRedemptions"
            inputMode="numeric"
            placeholder="unlimited"
            className={field}
          />
          <FieldError message={errors.maxRedemptions} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Expires</span>
          <input name="expiresAt" type="date" className={field} />
          <FieldError message={errors.expiresAt} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
          <span className={label}>Internal note (never shown to buyers)</span>
          <input name="note" maxLength={120} placeholder="Launch promotion" className={field} />
        </label>
      </div>

      <ActionMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Creating…">Create code</SubmitButton>
      </div>
    </form>
  );
}