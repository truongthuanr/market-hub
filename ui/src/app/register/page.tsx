"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const role = useMemo(() => {
        const requested = (searchParams?.get("role") || "").toLowerCase();
        return requested === "seller" ? "seller" : "buyer";
    }, [searchParams]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const form = event.currentTarget;
        const formData = new FormData(form);
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");
        const passwordConfirm = String(formData.get("passwordConfirm") || "");

        if (!email || !password) {
            setErrorMessage("Please enter an email and password.");
            return;
        }

        if (password !== passwordConfirm) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const baseUrl =
                process.env.NEXT_PUBLIC_AUTH_API_URL;
            console.log("Auth API URL:", `${baseUrl}/auth/register`);

            const response = await fetch(`${baseUrl}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, role }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                const detail =
                    payload?.detail ||
                    payload?.message ||
                    "Registration failed. Please try again.";
                setErrorMessage(detail);
                return;
            }

            setSuccessMessage("Account created. Please sign in.");
            form.reset();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Register failed:", error);
            setErrorMessage(`Error while registering, please try again. `);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <span>
                        {role === "seller"
                            ? "Registering as a buyer?"
                            : "Registering as a seller?"}
                    </span>
                    <Link
                        className="font-semibold text-zinc-900 underline-offset-4 hover:underline"
                        href={role === "seller" ? "/register" : "/register?role=seller"}
                    >
                        {role === "seller"
                            ? "Create a buyer account"
                            : "Create a seller account"}
                    </Link>
                </div>
            </div>

            <Card
                className={`rounded-3xl border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(24,24,27,0.12)] backdrop-blur ${
                    role === "seller"
                        ? "ring-1 ring-amber-200/80"
                        : "ring-1 ring-sky-200/80"
                }`}
            >
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
                    <CardTitle
                        className={`text-2xl font-semibold ${
                            role === "seller" ? "text-amber-700" : "text-sky-700"
                        }`}
                    >
                        {role === "seller" ? "Seller registration" : "Buyer registration"}
                    </CardTitle>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                        {role === "seller" ? "Seller" : "Buyer"}
                    </span>
                </CardHeader>
                <CardContent className="pt-6">
                    <form className="grid gap-4" onSubmit={handleSubmit}>
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
                            Confirm password
                            <Input
                                className="rounded-2xl border-zinc-200 bg-white/90 shadow-sm focus-visible:ring-zinc-200"
                                name="passwordConfirm"
                                placeholder="Confirm password"
                                type="password"
                                autoComplete="new-password"
                                required
                            />
                        </label>
                        
                        {errorMessage ? (
                            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                                {errorMessage}
                            </p>
                        ) : null}
                        {successMessage ? (
                            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                {successMessage}
                            </p>
                        ) : null}
                        <Button
                            className={`mt-2 w-full rounded-2xl ${
                                role === "seller"
                                    ? "bg-amber-600/80 text-white hover:bg-amber-700/80"
                                    : "bg-sky-600 text-white hover:bg-sky-700"
                            }`}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Creating account..."
                                : role === "seller"
                                  ? "Create seller account"
                                  : "Create buyer account"}
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
