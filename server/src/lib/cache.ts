/** Tiny time-based cache so we don't hit free public APIs on every page load. */
export class TtlCache<T> {
  private entries = new Map<string, { value: T; expires: number }>();
  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const hit = this.entries.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T) {
    this.entries.set(key, { value, expires: Date.now() + this.ttlMs });
  }
}

export class UpstreamError extends Error {}

export async function getJson<T>(fetcher: typeof fetch, url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetcher(url, {
      headers: { "User-Agent": "awesomework-dashboard/0.1", Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new UpstreamError(`Couldn't reach ${new URL(url).host}`);
  }
  if (!res.ok) throw new UpstreamError(`${new URL(url).host} answered ${res.status}`);
  return (await res.json()) as T;
}
