import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f4f4f5,_#e4e4e7_35%,_#d4d4d8_100%)] text-zinc-900">
      <div className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-white/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-4xl gap-10 md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Market Hub
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Build your account in minutes.
            </h1>
            <p className="text-base leading-relaxed text-zinc-600">
              Start managing listings, team access, and revenue from a single
              dashboard.
            </p>
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <span>Already have access?</span>
              <Link
                className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
                href="/login"
              >
                Sign in instead
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_rgba(24,24,27,0.12)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-zinc-900">Register</h2>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                Free
              </span>
            </div>
            <form className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Full name
                <input
                  className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  name="name"
                  placeholder="Alex Johnson"
                  type="text"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Work email
                <input
                  className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  name="email"
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Password
                <input
                  className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  name="password"
                  placeholder="Create a secure password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-700">
                Company size
                <select
                  className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  name="teamSize"
                  defaultValue="1-5"
                >
                  <option value="1-5">1-5 people</option>
                  <option value="6-20">6-20 people</option>
                  <option value="21-50">21-50 people</option>
                  <option value="51-200">51-200 people</option>
                  <option value="201+">201+ people</option>
                </select>
              </label>
              <button
                className="mt-2 w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                type="submit"
              >
                Create account
              </button>
            </form>
            <p className="mt-6 text-xs text-zinc-500">
              You can invite teammates and set roles after onboarding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
