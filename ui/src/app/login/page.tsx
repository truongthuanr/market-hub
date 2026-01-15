 "use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { setAuthToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setErrorMessage("Please enter an email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const detail =
          payload?.detail || payload?.message || "Login failed. Please try again.";
        setErrorMessage(detail);
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { access_token?: string }
        | null;
      if (!payload?.access_token) {
        setErrorMessage("Login failed. Token is missing.");
        return;
      }
      setAuthToken(payload.access_token);
      form.reset();
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Login failed:", error);
      setErrorMessage(`Unable to reach the auth service. ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell gridClassName="max-w-3xl">
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
          <form className="grid gap-4" onSubmit={handleSubmit}>
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
            {errorMessage ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {errorMessage}
              </p>
            ) : null}
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
            <Button
              className="mt-2 w-full rounded-2xl"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Continue"}
            </Button>
          </form>
          <p className="mt-6 text-xs text-zinc-500">
            By signing in you agree to the Terms and acknowledge the Privacy
            Policy.
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
