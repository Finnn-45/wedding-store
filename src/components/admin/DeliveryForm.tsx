"use client";

import { useActionState, useState } from "react";
import {
  saveDeliveryAssetAction,
  uploadSetupGuideAction,
} from "@/app/admin/actions";
import { ActionMessage, FieldError, SubmitButton, field, label } from "@/components/admin/Form";
import { BUCKETS } from "@/lib/supabase/config";

/**
 * Delivery assets editor — ADMIN ONLY.
 *
 * This is where the Canva template URL and the private setup-guide path are
 * managed. Neither value is ever sent to a public page: the storefront reads
 * products through RLS, and delivery_assets has no public policy at all.
 */
export function DeliveryForm({
  productId,
  productName,
  initialCanvaUrl = "",
  initialPdfPath = "",
}: {
  productId: string;
  productName: string;
  initialCanvaUrl?: string;
  initialPdfPath?: string;
}) {
  const [saveState, saveAction] = useActionState(saveDeliveryAssetAction, null);
  const [uploadState, uploadAction] = useActionState(uploadSetupGuideAction, null);
  const [path, setPath] = useState(initialPdfPath);
  const errors = saveState?.fieldErrors ?? {};

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body-sm text-stone">
        Delivery assets for <span className="text-ink">{productName}</span>.
        The Canva link and the setup guide are only ever resolved server-side,
        after a purchase check.
      </p>

      <form action={saveAction} className="flex flex-col gap-6">
        <input type="hidden" name="productId" value={productId} />

        <label className="flex flex-col gap-2">
          <span className={label}>Canva template URL (private) *</span>
          <input
            name="canvaTemplateUrl"
            type="url"
            required
            placeholder="https://www.canva.com/design/…"
            defaultValue={initialCanvaUrl}
            className={field}
          />
          <FieldError message={errors.canvaTemplateUrl} />
          <span className="text-body-sm text-stone">
            Prefer a “view and make a copy” link so the customer works in their
            own copy and the master design stays private.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={label}>Setup guide path (private) *</span>
          <input
            name="setupPdfPath"
            required
            placeholder={`${BUCKETS.private}/…`}
            value={path}
            onChange={(event) => setPath(event.target.value)}
            className={field}
          />
          <FieldError message={errors.setupPdfPath} />
        </label>

        <ActionMessage state={saveState} />
        <div>
          <SubmitButton pendingLabel="Saving…">
            Save delivery assets
          </SubmitButton>
        </div>
      </form>

      <form action={uploadAction} className="flex flex-col gap-4 border-t border-line pt-6">
        <input type="hidden" name="productId" value={productId} />
        <span className={label}>Upload a setup guide PDF</span>
        <input
          type="file"
          name="file"
          accept="application/pdf"
          className="text-body-sm"
        />
        <ActionMessage state={uploadState} />
        <div>
          <SubmitButton variant="outline" pendingLabel="Uploading…">
            Upload to private storage
          </SubmitButton>
        </div>
        <p className="text-body-sm text-stone">
          Uploads land in the <code>{BUCKETS.private}</code> bucket, which is
          not public. Customers receive a short-lived signed link instead.
        </p>
      </form>
    </div>
  );
}