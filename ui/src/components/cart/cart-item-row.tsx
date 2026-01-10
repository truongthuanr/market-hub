"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getServiceBaseUrl } from "@/lib/services";
import type { CartItem } from "@/lib/types";

type CartItemRowProps = {
  cartId: number;
  item: CartItem;
  productName?: string;
};

export function CartItemRow({ cartId, item, productName }: CartItemRowProps) {
  const router = useRouter();
  const [qty, setQty] = useState(item.qty);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const commerceBase = getServiceBaseUrl("commerce");
      const response = await fetch(
        `${commerceBase}/v1/carts/${cartId}/items/${item.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qty }),
        },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail =
          payload?.detail || payload?.message || "Unable to update item.";
        throw new Error(detail);
      }
      router.refresh();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(detail);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const commerceBase = getServiceBaseUrl("commerce");
      const response = await fetch(
        `${commerceBase}/v1/carts/${cartId}/items/${item.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok && response.status !== 204) {
        const payload = await response.json().catch(() => null);
        const detail =
          payload?.detail || payload?.message || "Unable to remove item.";
        throw new Error(detail);
      }
      router.refresh();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(detail);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">
            {productName || `Product ${item.product_id}`}
          </p>
          {item.sku ? (
            <p className="text-xs text-stone-500">SKU: {item.sku}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <span>Unit</span>
          <span className="font-semibold text-stone-900">{item.unit_price}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          className="h-9 w-24 rounded-2xl border-stone-200 bg-white"
          type="number"
          min={1}
          value={qty}
          onChange={(event) => setQty(Number(event.target.value))}
        />
        <Button
          className="rounded-2xl"
          type="button"
          onClick={handleUpdate}
          disabled={isSaving}
        >
          Update
        </Button>
        <Button
          className="rounded-2xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          type="button"
          onClick={handleRemove}
          disabled={isSaving}
        >
          Remove
        </Button>
        {errorMessage ? (
          <span className="text-xs text-rose-600">{errorMessage}</span>
        ) : null}
      </div>
    </div>
  );
}
