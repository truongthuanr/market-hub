"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthHeaders } from "@/lib/auth";
import { getServiceBaseUrl } from "@/lib/services";
import type { CatalogVariant } from "@/lib/types";

type AddToCartProps = {
  productId: number;
  variants: CatalogVariant[];
};

export function AddToCart({ productId, variants }: AddToCartProps) {
  const [qty, setQty] = useState(1);
  const [selectedId, setSelectedId] = useState<string>(
    String(variants[0]?.id ?? ""),
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => variants.find((variant) => String(variant.id) === selectedId) ?? null,
    [variants, selectedId],
  );

  const handleAdd = async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const commerceBase = getServiceBaseUrl("commerce");
      const cartResponse = await fetch(`${commerceBase}/v1/carts`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!cartResponse.ok) {
        throw new Error("Unable to access cart. Please sign in.");
      }
      const cart = (await cartResponse.json()) as { id: number };

      if (!selectedVariant) {
        throw new Error("Select a variant to add to cart.");
      }

      const unitPrice = Number(selectedVariant.price);
      const addResponse = await fetch(
        `${commerceBase}/v1/carts/${cart.id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            product_id: productId,
            sku: selectedVariant.sku,
            qty,
            unit_price: unitPrice,
          }),
        },
      );

      if (!addResponse.ok) {
        const payload = await addResponse.json().catch(() => null);
        const detail =
          payload?.detail || payload?.message || "Failed to add item.";
        throw new Error(detail);
      }

      setStatus("success");
      setMessage("Added to cart.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setStatus("error");
      setMessage(detail);
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="grid gap-3 text-sm text-stone-700">
        <label className="grid gap-2">
          Variant
          <select
            className="h-10 rounded-2xl border border-stone-200 bg-white px-3 text-sm"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {variants.map((variant) => (
              <option key={variant.id} value={String(variant.id)}>
                {variant.sku || `Variant ${variant.id}`} · {variant.price}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          Quantity
          <Input
            className="h-10 rounded-2xl border-stone-200 bg-white"
            type="number"
            min={1}
            value={qty}
            onChange={(event) => setQty(Number(event.target.value))}
          />
        </label>
      </div>
      {message ? (
        <p
          className={`mt-3 rounded-2xl border px-3 py-2 text-xs ${
            status === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
      <Button
        className="mt-4 w-full rounded-2xl"
        type="button"
        onClick={handleAdd}
        disabled={status === "loading" || !selectedVariant}
      >
        {status === "loading" ? "Adding..." : "Add to cart"}
      </Button>
    </div>
  );
}
