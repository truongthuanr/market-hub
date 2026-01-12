import { SiteShell } from "@/components/layout/site-shell";

export default function AdminOrdersPage() {
  return (
    <SiteShell title="Admin Orders" subtitle="Track and manage orders.">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-stone-600 shadow-sm backdrop-blur">
        Admin order tools will be connected to commerce and payment services.
      </div>
    </SiteShell>
  );
}
