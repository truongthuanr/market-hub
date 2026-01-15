"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { clearAuthToken, getAuthToken } from "@/lib/auth";

type AuthState = "unknown" | "authenticated" | "guest";

type AuthUser = {
  email: string;
};

export function AuthActions() {
  const [authState, setAuthState] = useState<AuthState>("unknown");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
        if (!baseUrl) {
          console.error("NEXT_PUBLIC_AUTH_API_URL is not set.");
          setAuthState("guest");
          return;
        }
        const token = getAuthToken();
        if (!token) {
          setUser(null);
          setAuthState("guest");
          return;
        }
        const response = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const payload = (await response.json().catch(() => null)) as AuthUser | null;
          setUser(payload);
          setAuthState("authenticated");
        } else {
          clearAuthToken();
          setUser(null);
          setAuthState("guest");
        }
      } catch (error) {
        console.error("Failed to check session:", error);
        setUser(null);
        setAuthState("guest");
      }
    };
    checkSession();
  }, []);

  if (authState === "unknown") {
    return null;
  }

  if (authState === "authenticated") {
    return (
      <>
        {user?.email ? (
          <span className="text-sm font-semibold text-stone-700">
            {user.email}
          </span>
        ) : null}
        <LogoutButton />
        <button className="rounded-full bg-[#6b705c] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5d6250]">
          Cart (2)
        </button>
      </>
    );
  }

  return (
    <>
      <Link className="text-sm font-semibold text-stone-700" href="/login">
        Login
      </Link>
      <Link
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
        href="/register"
      >
        Register
      </Link>
    </>
  );
}
