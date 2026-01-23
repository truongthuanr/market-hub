import { getPublicServiceBaseUrl } from "@/lib/services";

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const authBase = getPublicServiceBaseUrl("auth");
        const response = await fetch(`${authBase}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const response = await fetch(input, { ...init, credentials: "include" });
  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    return response;
  }

  return fetch(input, { ...init, credentials: "include" });
}
