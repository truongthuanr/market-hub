import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteShell } from "@/components/layout/site-shell";
import { fetchAllPages } from "@/lib/http";
import { getServiceBaseUrl } from "@/lib/services";
import type { CatalogCategory, CatalogProduct } from "@/lib/types";

type CategoryPageProps = {
  params: { slug: string };
};

async function loadCategoryAndProducts(slug: string) {
  const catalogBase = getServiceBaseUrl("catalog");
  const categories = await fetchAllPages<CatalogCategory>(
    `${catalogBase}/v1/categories/`,
  );
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    return { category: null, products: [] };
  }
  const products = await fetchAllPages<CatalogProduct>(
    `${catalogBase}/v1/products/`,
  );
  const filtered = products.filter((product) => product.category === category.id);
  return { category, products: filtered };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category, products } = await loadCategoryAndProducts(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <SiteShell
      title={category.name}
      subtitle={`Browse ${products.length} item(s) in this category.`}
    >
      {products.length === 0 ? (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
          No products available yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur"
            >
              <p className="text-sm text-stone-500">Product</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-900">
                {product.name}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                {product.description || "No description provided."}
              </p>
              <Link
                className="mt-4 inline-flex items-center text-sm font-semibold text-stone-700 hover:text-stone-900"
                href={`/product/${product.slug}`}
              >
                View detail →
              </Link>
            </div>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
