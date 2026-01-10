import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { fetchJson } from "@/lib/http";
import { getServiceBaseUrl } from "@/lib/services";
import { getCookieHeader } from "@/lib/server-cookies";
import type { CatalogProduct, Order } from "@/lib/types";

type OrderPageProps = {
  params: { id: string };
};

function formatMoney(value: number, currency = "VND") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

async function loadOrder(orderId: string) {
  const commerceBase = getServiceBaseUrl("commerce");
  const cookieHeader = getCookieHeader();
  return fetchJson<Order>(`${commerceBase}/v1/orders/${orderId}`, {
    headers: {
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

export default async function OrderDetailPage({ params }: OrderPageProps) {
  let order: Order | null = null;

  try {
    order = await loadOrder(params.id);
  } catch (error) {
    notFound();
  }

  if (!order) {
    notFound();
  }

  const productMap = await loadProducts(order.items.map((item) => item.product_id));

  return (
    <SiteShell
      title={`Order #${order.id}`}
      subtitle={`Status: ${order.status}`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {order.items.map((item) => (
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
              {formatMoney(Number(order.total_amount))}
            </p>
            <p className="mt-1 text-xs text-stone-500">Currency: VND</p>
          </div>
          <Link
            className="inline-flex w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            href="/orders"
          >
            Back to orders
          </Link>
        </aside>
      </div>
    </SiteShell>
  );
}
