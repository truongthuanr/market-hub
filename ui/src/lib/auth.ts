const TOKEN_KEY = "markethub_access_token";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return null;
}

function setCookieValue(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=/; samesite=lax`;
}

function clearCookieValue(name: string) {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return getCookieValue(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }
  setCookieValue(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }
  clearCookieValue(TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
