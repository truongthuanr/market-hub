import Link from "next/link";

import { CheckoutActions } from "@/components/checkout/checkout-actions";
import { SiteShell } from "@/components/layout/site-shell";
import { fetchJson } from "@/lib/http";
import { getServiceBaseUrl } from "@/lib/services";
import { getCookieHeader } from "@/lib/server-cookies";
import type { Cart, CatalogProduct } from "@/lib/types";

function formatMoney(value: number, currency = "VND") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function loadCart() {
  const commerceBase = getServiceBaseUrl("commerce");
  const cookieHeader = getCookieHeader();
  return fetchJson<Cart>(`${commerceBase}/v1/carts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });
}

async function loadProducts(productIds: number[]) {
  const catalogBase = getServiceBaseUrl("catalog");
  const uniqueIds = Array.from(new Set(productIds));
  const results = await Promise.all(
    uniqueIds.map((id) =>
      fetchJson<CatalogProduct>(`${catalogBase}/v1/products/${id}/`),
    ),
  );
  return new Map(results.map((product) => [product.id, product]));
}

export default async function CheckoutPage() {
  let cart: Cart | null = null;
  let errorMessage: string | null = null;

  try {
    cart = await loadCart();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unable to load cart.";
  }

  if (!cart) {
    return (
      <SiteShell title="Checkout" subtitle="Confirm your order details.">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
          {errorMessage || "Please sign in to checkout."}
        </div>
      </SiteShell>
    );
  }

  if (cart.items.length === 0) {
    return (
      <SiteShell title="Checkout" subtitle="Confirm your order details.">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
          Your cart is empty. Visit{" "}
          <Link className="font-semibold text-stone-900" href="/">
            the catalog
          </Link>{" "}
          to add items.
        </div>
      </SiteShell>
    );
  }

  const productMap = await loadProducts(cart.items.map((item) => item.product_id));
  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.qty,
    0,
  );

  return (
    <SiteShell title="Checkout" subtitle="Confirm your order details.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
            >
              <p className="text-sm font-semibold text-stone-900">
                {productMap.get(item.product_id)?.name ||
                  `Product ${item.product_id}`}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                <span>Qty {item.qty}</span>
                <span>Unit {item.unit_price}</span>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Total
            </p>
            <p className="mt-3 text-2xl font-semibold text-stone-900">
              {formatMoney(total)}
            </p>
            <p className="mt-1 text-xs text-stone-500">Currency: VND</p>
          </div>
          <CheckoutActions
            cartId={cart.id}
            totalAmount={String(total)}
            currency="VND"
          />
        </aside>
      </div>
    </SiteShell>
  );
}
