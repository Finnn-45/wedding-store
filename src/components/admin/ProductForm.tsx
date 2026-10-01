"use client";

import { useActionState } from "react";
import { saveProductAction } from "@/app/admin/actions";
import { ActionMessage, FieldError, SubmitButton, field, label } from "@/components/admin/Form";
import type { Product } from "@/data/products";

const TYPES = ["wedding-website", "save-the-date", "bundle", "custom"];
const STYLES = ["modern", "editorial", "minimal", "garden", "classic", "romantic", "other"];

/**
 * Product editor.
 *
 * Client-side validation here is a convenience only — the server action
 * re-validates every field, and the database has its own constraints.
 */
export function ProductForm({
  product,
}: {
  product?: Product & { id: string; published: boolean };
}) {
  const [state, action] = useActionState(saveProductAction, null);
  const errors = state?.fieldErrors ?? {};

  return (
    <form action={action} className="flex flex-col gap-8">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>Name *</span>
          <input name="name" required defaultValue={product?.name ?? ""} className={field} />
          <FieldError message={errors.name} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Slug *</span>
          <input
            name="slug"
            required
            defaultValue={product?.slug ?? ""}
            placeholder="modern-ivory"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={field}
          />
          <FieldError message={errors.slug} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Type *</span>
          <select name="type" defaultValue={product?.type ?? "wedding-website"} className={field}>
            {TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <FieldError message={errors.type} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Style *</span>
          <select name="style" defaultValue={product?.style ?? "modern"} className={field}>
            {STYLES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <FieldError message={errors.style} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Price *</span>
          <input
            name="price"
            required
            inputMode="decimal"
            defaultValue={product?.price ?? ""}
            className={field}
          />
          <FieldError message={errors.price} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Compare-at price</span>
          <input
            name="compareAtPrice"
            inputMode="decimal"
            defaultValue={product?.compareAtPrice ?? ""}
            className={field}
          />
          <FieldError message={errors.compareAtPrice} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Currency</span>
          <input name="currency" defaultValue={product?.currency ?? "USD"} maxLength={3} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Cover image</span>
          <input name="coverImage" defaultValue={product?.coverImage ?? ""} className={field} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>Public demo URL (https only)</span>
          <input
            name="demoUrl"
            type="url"
            placeholder="https://…"
            defaultValue={product?.demoUrl ?? ""}
            className={field}
          />
          <FieldError message={errors.demoUrl} />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>Short description</span>
          <input
            name="shortDescription"
            defaultValue={product?.shortDescription ?? ""}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>Description</span>
          <textarea
            name="description"
            rows={5}
            defaultValue={product?.description ?? ""}
            className={`${field} resize-y`}
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>Included sections (one per line)</span>
          <textarea
            name="includedSections"
            rows={5}
            defaultValue={(product?.includedSections ?? []).join("\n")}
            className={`${field} resize-y`}
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>Features (one per line)</span>
          <textarea
            name="features"
            rows={4}
            defaultValue={(product?.features ?? []).join("\n")}
            className={`${field} resize-y`}
          />
        </label>
        <label className="flex flex-col gap-2 sm:col-span-2">
          <span className={label}>What is included (one per line)</span>
          <textarea
            name="whatsIncluded"
            rows={4}
            defaultValue={(product?.whatsIncluded ?? []).join("\n")}
            className={`${field} resize-y`}
          />
        </label>
      </div>

      <fieldset className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-body-sm">
          <input type="checkbox" name="published" defaultChecked={product?.published ?? false} />
          Published
        </label>
        <label className="flex items-center gap-2 text-body-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-body-sm">
          <input type="checkbox" name="priceFrom" defaultChecked={product?.priceFrom ?? false} />
          "Starting at" price
        </label>
      </fieldset>

      <ActionMessage state={state} />
      <div>
        <SubmitButton>{product ? "Save product" : "Create product"}</SubmitButton>
      </div>
    </form>
  );
}