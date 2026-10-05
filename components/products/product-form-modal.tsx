"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { ProductDetail } from "@/types/product";

type ProductFormValues = {
  title: string;
  creator_name: string;
  description: string;
  price: string;
  inventory: string;
};

interface ProductFormModalProps {
  product: ProductDetail | null;
  onClose: () => void;
  onSave: (product: ProductDetail) => void;
}

const EMPTY_FORM: ProductFormValues = {
  title: "",
  creator_name: "",
  description: "",
  price: "",
  inventory: "0",
};

export default function ProductFormModal({
  product,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    product
      ? {
          title: product.title,
          creator_name: product.creator_name,
          description: product.description,
          price: product.price,
          inventory: String(product.inventory),
        }
      : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const price = Number(values.price);
    const inventory = Number(values.inventory);
    if (!values.title.trim() || !values.creator_name.trim()) {
      setError("Product name and seller are required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a price greater than zero.");
      return;
    }
    if (!Number.isInteger(inventory) || inventory < 0) {
      setError("Inventory must be a whole number of zero or more.");
      return;
    }

    const now = new Date().toISOString();
    onSave({
      id: product?.id ?? Date.now(),
      creator_id: product?.creator_id ?? "demo-seller",
      creator_name: values.creator_name.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      image: product?.image ?? null,
      price: price.toFixed(2),
      discounted_price: price.toFixed(2),
      inventory,
      tags: product?.tags ?? "",
      tag_list: product?.tag_list ?? [],
      discount: product?.discount ?? "0",
      ar_link: product?.ar_link ?? null,
      weight: product?.weight ?? null,
      height: product?.height ?? null,
      width: product?.width ?? null,
      length: product?.length ?? null,
      variants: product?.variants ?? [],
      created_at: product?.created_at ?? now,
      updated_at: now,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 id="product-form-title" className="text-xl font-semibold">
              {product ? "Edit product" : "Add product"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo changes are saved in this browser only.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close form">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Product name"
            value={values.title}
            onChange={(value) => updateField("title", value)}
            required
          />
          <Field
            label="Seller"
            value={values.creator_name}
            onChange={(value) => updateField("creator_name", value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Price"
              type="number"
              min="0.01"
              step="0.01"
              value={values.price}
              onChange={(value) => updateField("price", value)}
              required
            />
            <Field
              label="Inventory"
              type="number"
              min="0"
              step="1"
              value={values.inventory}
              onChange={(value) => updateField("inventory", value)}
              required
            />
          </div>
          <label className="block text-sm font-medium">
            Description
            <textarea
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-border px-3 py-2 font-normal outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              {product ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  min,
  step,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        min={min}
        step={step}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-border px-3 font-normal outline-none focus:ring-1 focus:ring-ring"
      />
    </label>
  );
}
