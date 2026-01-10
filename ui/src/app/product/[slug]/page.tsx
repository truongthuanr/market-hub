import { notFound } from "next/navigation";

import { AddToCart } from "@/components/cart/add-to-cart";
import { SiteShell } from "@/components/layout/site-shell";
import { fetchAllPages, fetchJson } from "@/lib/http";
import { getServiceBaseUrl } from "@/lib/services";
import type { CatalogProduct } from "@/lib/types";

type ProductPageProps = {
  params: { slug: string };
};

async function loadProduct(slug: string) {
  const catalogBase = getServiceBaseUrl("catalog");
  const products = await fetchAllPages<CatalogProduct>(
    `${catalogBase}/v1/products/`,
  );
  const match = products.find((product) => product.slug === slug);
  if (!match) {
    return null;
  }
  return fetchJson<CatalogProduct>(`${catalogBase}/v1/products/${match.id}/`);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await loadProduct(params.slug);

  if (!product) {
    notFound();
  }

  const variants = product.variants ?? [];
  const images = product.images ?? [];

  return (
    <SiteShell title={product.name} subtitle="Product detail">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Description
          </p>
          <p className="mt-4 text-sm text-stone-700">
            {product.description || "No description provided yet."}
          </p>
          {images.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="rounded-3xl border border-stone-100 bg-white p-3 text-xs text-stone-500"
                >
                  <p>Image {image.position ?? image.id}</p>
                  <a
                    className="mt-2 block truncate text-sm font-semibold text-stone-700 hover:text-stone-900"
                    href={image.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {image.url}
                  </a>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Variants
            </p>
            {variants.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">
                No variants available yet.
              </p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm text-stone-700">
                {variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white px-4 py-3"
                  >
                    <span>{variant.sku || `Variant ${variant.id}`}</span>
                    <span className="font-semibold text-stone-900">
                      {variant.price}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {variants.length > 0 ? (
            <AddToCart productId={product.id} variants={variants} />
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}
