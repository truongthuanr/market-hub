"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { getServiceBaseUrl } from "@/lib/services";

type CheckoutActionsProps = {
  cartId: number;
  totalAmount: string;
  currency: string;
};

type PaymentResponse = {
  payment_id: number;
  status: string;
  qr_url?: string | null;
  checkout_url?: string | null;
  expires_at?: string | null;
};

export function CheckoutActions({
  cartId,
  totalAmount,
  currency,
}: CheckoutActionsProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);

  const totalValue = useMemo(() => Number(totalAmount), [totalAmount]);

  const handleCheckout = async () => {
    setStatus("loading");
    setMessage(null);
    setPayment(null);

    try {
      const commerceBase = getServiceBaseUrl("commerce");
      const paymentBase = getServiceBaseUrl("payment");
      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const checkoutResponse = await fetch(`${commerceBase}/v1/checkouts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ cart_id: cartId }),
      });

      if (!checkoutResponse.ok) {
        const payload = await checkoutResponse.json().catch(() => null);
        const detail =
          payload?.detail || payload?.message || "Checkout failed.";
        throw new Error(detail);
      }

      const checkout = (await checkoutResponse.json()) as {
        order_id: number;
      };
      const returnUrl = `${window.location.origin}/orders/${checkout.order_id}`;

      const paymentResponse = await fetch(`${paymentBase}/v1/payments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          amount: Math.round(totalValue),
          currency,
          order_id: String(checkout.order_id),
          return_url: returnUrl,
        }),
      });

      if (!paymentResponse.ok) {
        const payload = await paymentResponse.json().catch(() => null);
        const detail =
          payload?.detail || payload?.message || "Payment failed.";
        throw new Error(detail);
      }

      const paymentPayload = (await paymentResponse.json()) as PaymentResponse;
      setPayment(paymentPayload);
      setStatus("success");
      setMessage("Payment created. Follow the link to complete the payment.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown error";
      setStatus("error");
      setMessage(detail);
    }
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
      <Button
        className="w-full rounded-2xl"
        type="button"
        onClick={handleCheckout}
        disabled={status === "loading" || totalValue <= 0}
      >
        {status === "loading" ? "Processing..." : "Confirm & Pay"}
      </Button>
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
      {payment ? (
        <div className="mt-4 space-y-2 text-sm">
          {payment.checkout_url ? (
            <a
              className="block rounded-2xl border border-stone-200 bg-white px-4 py-2 text-center font-semibold text-stone-700 hover:bg-stone-50"
              href={payment.checkout_url}
              target="_blank"
              rel="noreferrer"
            >
              Open checkout
            </a>
          ) : null}
          {payment.qr_url ? (
            <a
              className="block rounded-2xl border border-stone-200 bg-white px-4 py-2 text-center font-semibold text-stone-700 hover:bg-stone-50"
              href={payment.qr_url}
              target="_blank"
              rel="noreferrer"
            >
              View QR code
            </a>
          ) : null}
          <p className="text-xs text-stone-500">Status: {payment.status}</p>
        </div>
      ) : null}
    </div>
  );
}
