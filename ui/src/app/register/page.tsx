import Link from "next/link";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  return (
    <AuthShell>
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

      <Card className="rounded-3xl border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(24,24,27,0.12)] backdrop-blur">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-2xl font-semibold text-zinc-900">
            Register
          </CardTitle>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
            Free
          </span>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Full name
              <Input
                className="rounded-2xl border-zinc-200 bg-white/90 shadow-sm focus-visible:ring-zinc-200"
                name="name"
                placeholder="Alex Johnson"
                type="text"
                autoComplete="name"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Work email
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
                placeholder="Create a secure password"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-zinc-700">
              Company size
              <select
                className="w-full rounded-2xl border border-zinc-200 bg-white/90 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
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
            <Button className="mt-2 w-full rounded-2xl" type="submit">
              Create account
            </Button>
          </form>
          <p className="mt-6 text-xs text-zinc-500">
            You can invite teammates and set roles after onboarding.
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
