import Link from "next/link";

import { CartItemRow } from "@/components/cart/cart-item-row";
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

export default async function CartPage() {
  let cart: Cart | null = null;
  let errorMessage: string | null = null;

  try {
    cart = await loadCart();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unable to load cart.";
  }

  if (!cart) {
    return (
      <SiteShell title="Your cart" subtitle="Review items before checkout.">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
          {errorMessage || "Please sign in to view your cart."}
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
    <SiteShell title="Your cart" subtitle="Review items before checkout.">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {cart.items.length === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
              Your cart is empty. Visit{" "}
              <Link className="font-semibold text-stone-900" href="/">
                the catalog
              </Link>{" "}
              to add items.
            </div>
          ) : (
            cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                cartId={cart.id}
                item={item}
                productName={productMap.get(item.product_id)?.name}
              />
            ))
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Summary
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
              <span>Items</span>
              <span>{cart.items.length}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-stone-600">
              <span>Total</span>
              <span className="font-semibold text-stone-900">
                {formatMoney(total)}
              </span>
            </div>
            <Link
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-[#6b705c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5d6250]"
              href="/checkout"
            >
              Proceed to checkout
            </Link>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}
