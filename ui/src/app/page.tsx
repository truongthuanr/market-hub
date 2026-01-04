export default function Home() {
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
        <div className="order-3 w-full md:order-none md:w-auto md:flex-1 md:px-6">
          <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-4 py-2 shadow-[0_18px_45px_rgba(90,72,50,0.16)] backdrop-blur">
            <input
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              placeholder="Search products, brands, or SKU..."
              type="text"
            />
            <button className="rounded-full bg-[#b08968] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#9c7a5d]">
              Search
            </button>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-700 md:flex">
          <a className="hover:text-stone-900" href="#categories">
            Categories
          </a>
          <a className="hover:text-stone-900" href="#flash-sale">
            Flash sale
          </a>
          <a className="hover:text-stone-900" href="#guides">
            Guides
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a className="text-sm font-semibold text-stone-700" href="/login">
            Login
          </a>
          <a
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            href="/register"
          >
            Register
          </a>
          <button className="rounded-full bg-[#6b705c] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5d6250]">
            Cart (2)
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-20">
        <section
          id="flash-sale"
          className="mb-8 rounded-[32px] border border-white/70 bg-[#5f6f52] px-6 py-4 text-white shadow-[0_20px_60px_rgba(70,60,40,0.25)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#efe7da]">
                Flash Sale
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                48-hour wholesale drop: packaging, wellness, home goods.
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/40 px-3 py-1 text-xs">
                Ends in 12:14:32
              </span>
              <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#485042]">
                Shop deals
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                  Featured categories
                </p>
                <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                  Build your storefront with trusted suppliers.
                </h1>
              </div>
              <button className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                View all
              </button>
            </div>

            <div
              id="categories"
              className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                "Packaging + Shipping",
                "Home & Kitchen",
                "Electronics",
                "Beauty & Wellness",
                "Office Essentials",
                "Outdoor & Garden",
              ].map((category, index) => (
                <div
                  key={category}
                  className="flex min-h-[160px] flex-col justify-between rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
                >
                  <span className="text-xs font-semibold text-stone-500">
                    0{index + 1}
                  </span>
                  <p className="text-lg font-semibold text-stone-900">
                    {category}
                  </p>
                  <p className="text-xs text-stone-500">Updated today</p>
                </div>
              ))}
              <div className="flex min-h-[160px] flex-col justify-between rounded-3xl border border-white/70 bg-[#b08968] p-4 text-white shadow-sm">
                <span className="text-xs font-semibold text-white/80">
                  Featured
                </span>
                <p className="text-lg font-semibold">
                  Sustainable bundles for Q2
                </p>
                <button className="text-left text-xs font-semibold text-white/90">
                  Explore collection
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                Today picks
              </p>
              <div className="mt-4 space-y-3">
                {[
                  "Top-selling refill kits",
                  "Fast-moving cafe supplies",
                  "Best-rated smart home",
                  "Low MOQ wellness packs",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-stone-100 bg-white px-3 py-3 text-xs"
                  >
                    <span className="font-semibold text-stone-800">{item}</span>
                    <span className="text-stone-400">View</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                Top sales today
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">
                    Eco mailers
                  </span>
                  <span className="text-stone-500">+18%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">
                    Beverage kits
                  </span>
                  <span className="text-stone-500">+12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">
                    Cable bundles
                  </span>
                  <span className="text-stone-500">+9%</span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section id="guides" className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Marketplace guide
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              How to source, save, and ship faster.
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              Compare suppliers, track price drops, and consolidate orders into
              fewer shipments. Built-in terms and compliance help you scale
              across categories.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-[#6b705c] px-4 py-2 text-sm font-semibold text-white">
                Read handbook
              </button>
              <button className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700">
                Supplier rules
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Shipping policy",
                desc: "Standard 3-5 days with tracking.",
              },
              {
                title: "Returns + disputes",
                desc: "Easy returns within 30 days.",
              },
              {
                title: "Verification",
                desc: "Supplier checks in 48 hours.",
              },
              {
                title: "Support",
                desc: "24/7 marketplace concierge.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
              >
                <p className="text-sm font-semibold text-stone-900">
                  {item.title}
                </p>
                <p className="mt-2 text-xs text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
