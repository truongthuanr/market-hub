import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f4f4f5,_#e4e4e7_35%,_#d4d4d8_100%)] text-zinc-900">
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-white/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-white/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-3xl gap-10 md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center gap-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Market Hub
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              Sign in to manage your storefront.
            </h1>
            <p className="text-base leading-relaxed text-zinc-600">
              Access orders, inventory, and customer activity from one focused
              workspace.
            </p>
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <span>New here?</span>
              <Link
                className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
                href="/register"
              >
                Create an account
              </Link>
            </div>
          </div>

          <Card className="rounded-3xl border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(24,24,27,0.12)] backdrop-blur">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-2xl font-semibold text-zinc-900">
                Login
              </CardTitle>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                v0.1
              </span>
            </CardHeader>
            <CardContent className="pt-6">
              <form className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                  Email
                  <Input
                    className="rounded-2xl border-zinc-200 bg-white/90 shadow-sm focus-visible:ring-zinc-200"
                    name="email"
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-zinc-700">
                  Password
                  <Input
                    className="rounded-2xl border-zinc-200 bg-white/90 shadow-sm focus-visible:ring-zinc-200"
                    name="password"
                    placeholder="********"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <div className="flex items-center justify-between text-sm text-zinc-600">
                  <label className="flex items-center gap-2">
                    <input
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                      type="checkbox"
                      name="remember"
                    />
                    Remember me
                  </label>
                  <button
                    className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button className="mt-2 w-full rounded-2xl" type="submit">
                  Continue
                </Button>
              </form>
              <p className="mt-6 text-xs text-zinc-500">
                By signing in you agree to the Terms and acknowledge the Privacy
                Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
