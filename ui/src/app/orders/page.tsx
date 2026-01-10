import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { fetchJson } from "@/lib/http";
import { getServiceBaseUrl } from "@/lib/services";
import { getCookieHeader } from "@/lib/server-cookies";
import type { Order } from "@/lib/types";

function formatMoney(value: number, currency = "VND") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function loadOrders() {
  const commerceBase = getServiceBaseUrl("commerce");
  const cookieHeader = getCookieHeader();
  return fetchJson<Order[]>(`${commerceBase}/v1/orders`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });
}

export default async function OrdersPage() {
  let orders: Order[] = [];
  let errorMessage: string | null = null;

  try {
    orders = await loadOrders();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unable to load orders.";
  }

  return (
    <SiteShell title="Orders" subtitle="Track recent purchases and statuses.">
      {errorMessage ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
          {errorMessage}
        </div>
      ) : null}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
          No orders yet. Browse{" "}
          <Link className="font-semibold text-stone-900" href="/">
            the catalog
          </Link>{" "}
          to place your first order.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5"
              href={`/orders/${order.id}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                Order #{order.id}
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-900">
                {formatMoney(Number(order.total_amount))}
              </p>
              <p className="mt-1 text-sm text-stone-600">Status: {order.status}</p>
              <p className="mt-2 text-xs text-stone-500">
                Items: {order.items?.length ?? 0}
              </p>
            </Link>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
