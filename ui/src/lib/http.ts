export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const payload = await parseJson<Record<string, unknown>>(response).catch(
      () => ({}),
    );
    const detail =
      typeof payload.detail === "string"
        ? payload.detail
        : typeof payload.message === "string"
          ? payload.message
          : `Request failed with status ${response.status}`;
    throw new Error(detail);
  }
  return parseJson<T>(response);
}

export async function fetchAllPages<T>(
  url: string,
  init?: RequestInit,
): Promise<T[]> {
  let nextUrl: string | null = url;
  const items: T[] = [];

  while (nextUrl) {
    const response = await fetchJson<PaginatedResponse<T> | T[]>(nextUrl, init);
    if (Array.isArray(response)) {
      items.push(...response);
      break;
    }
    items.push(...response.results);
    nextUrl = response.next;
  }

  return items;
}
