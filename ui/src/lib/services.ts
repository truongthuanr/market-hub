const envMap = {
  auth: "NEXT_PUBLIC_AUTH_API_URL",
  catalog: "NEXT_PUBLIC_CATALOG_API_URL",
  commerce: "NEXT_PUBLIC_COMMERCE_API_URL",
  payment: "NEXT_PUBLIC_PAYMENT_API_URL",
} as const;

const serverEnvMap = {
  auth: "AUTH_API_URL",
  catalog: "CATALOG_API_URL",
  commerce: "COMMERCE_API_URL",
  payment: "PAYMENT_API_URL",
} as const;

export type ServiceName = keyof typeof envMap;

export function getServiceBaseUrl(service: ServiceName): string {
  const isServer = typeof window === "undefined";
  const envKey = isServer ? serverEnvMap[service] : envMap[service];
  const value = process.env[envKey];
  if (!value) {
    throw new Error(`${envKey} is not set.`);
  }
  return value.replace(/\/+$/, "");
}
