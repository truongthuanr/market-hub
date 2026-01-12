import "server-only";

import { cookies } from "next/headers";

export function getCookieHeader(): string {
  const store = cookies();
  return store.toString();
}
