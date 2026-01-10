import { SiteShell } from "@/components/layout/site-shell";

export default function AdminProductsPage() {
  return (
    <SiteShell
      title="Admin Products"
      subtitle="Manage catalog items and listings."
    >
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
        Admin product management will be wired to the catalog service next.
      </div>
    </SiteShell>
  );
}
