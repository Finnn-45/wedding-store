"use client";

import { useActionState } from "react";
import { confirmOrderPaidAction } from "@/app/admin/actions";
import { ActionMessage, SubmitButton, field, label } from "@/components/admin/Form";

/**
 * Manual payment confirmation.
 *
 * Requiring a written reason is deliberate: this is the one admin action that
 * can unlock a product without money moving, so it must leave a trail. The
 * action records who confirmed, when, and why.
 */
export function OrderConfirmForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(confirmOrderPaidAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="orderId" value={orderId} />
      <p className="text-body-sm text-stone">
        Marking an order paid unlocks the customer&apos;s Canva template and setup
        guide. Only do this after the money has actually arrived.
      </p>
      <label className="flex flex-col gap-2">
        <span className={label}>Reason / reference *</span>
        <input
          name="note"
          required
          placeholder="Bank transfer received 12 Mar, ref 8812"
          className={field}
        />
      </label>
      <ActionMessage state={state} />
      <div>
        <SubmitButton pendingLabel="Confirming…">
          Confirm payment received
        </SubmitButton>
      </div>
    </form>
  );
}