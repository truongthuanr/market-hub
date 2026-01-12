import Link from "next/link";

import { AuthActions } from "@/components/auth/auth-actions";

type SiteShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SiteShell({ title, subtitle, children }: SiteShellProps) {
  return (
    <div className="page-surface">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4f5d4a] text-sm font-semibold text-white">
            MH
          </div>
          <div>
            <p className="text-sm font-semibold">Market Hub</p>
            <p className="text-xs text-stone-500">Unified marketplace</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-stone-700">
          <Link className="hover:text-stone-900" href="/">
            Home
          </Link>
          <Link className="hover:text-stone-900" href="/orders">
            Orders
          </Link>
          <Link className="hover:text-stone-900" href="/cart">
            Cart
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <AuthActions />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8 rounded-[28px] border border-white/70 bg-white/80 px-6 py-6 shadow-[0_16px_40px_rgba(90,72,50,0.18)] backdrop-blur">
          <h1 className="text-3xl font-semibold text-stone-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-stone-600">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
