"use client";

import { useActionState } from "react";
import {
  deleteProductAction,
  setProductPublishedAction,
} from "@/app/admin/actions";
import { ActionMessage, SubmitButton, field, label } from "@/components/admin/Form";

/** Publish / unpublish + delete. Both are server actions guarded by requireAdmin. */
export function ProductPublishControls({
  productId,
  published,
}: {
  productId: string;
  published: boolean;
}) {
  const [publishState, publishAction] = useActionState(
    setProductPublishedAction,
    null,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteProductAction,
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={publishAction} className="flex items-center gap-4">
        <input type="hidden" name="id" value={productId} />
        <input type="hidden" name="published" value={published ? "false" : "true"} />
        <SubmitButton variant="outline" size="sm" pendingLabel="Working…">
          {published ? "Unpublish" : "Publish"}
        </SubmitButton>
        <span className="text-body-sm text-stone">
          {published
            ? "Visible in the shop, search and sitemap."
            : "Hidden from the storefront."}
        </span>
      </form>
      <ActionMessage state={publishState} />

      <form action={deleteAction} className="flex flex-wrap items-end gap-4">
        <input type="hidden" name="id" value={productId} />
        <label className="flex flex-1 flex-col gap-1">
          <span className={label}>Delete this product</span>
          <span className="text-body-sm text-stone">
            Only possible while the product has no sales history.
          </span>
        </label>
        <SubmitButton variant="ghost" size="sm" pendingLabel="Deleting…">
          Delete
        </SubmitButton>
      </form>
      <ActionMessage state={deleteState} />
    </div>
  );
}