import { describe, expect, it } from "vitest";
import { SupabaseTaskRepository } from "../src/lib/supabaseTaskRepository.js";

const ID = "6f1c2b9e-3a4d-4e5f-8a9b-0c1d2e3f4a5b";
const row = { id: ID, title: "Water plants", due: "2026-11-21", done: false, created_at: "2026-11-20T10:00:00Z" };

/** Records requests and answers like PostgREST would. */
function fakeRest(respond: (req: { method: string; url: URL; body: unknown }) => unknown) {
  const calls: { method: string; url: URL; body: unknown }[] = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    const req = { method: init?.method ?? "GET", url: new URL(String(input)), body: init?.body ? JSON.parse(String(init.body)) : undefined };
    calls.push(req);
    return new Response(JSON.stringify(respond(req)), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  return { fetcher, calls };
}

const repo = (f: typeof fetch) => new SupabaseTaskRepository("https://example.supabase.co", "sb_secret_test", f);

describe("SupabaseTaskRepository", () => {
  it("lists tasks and maps column names", async () => {
    const { fetcher, calls } = fakeRest(() => [row]);
    expect(await repo(fetcher).list()).toEqual([
      { id: ID, title: "Water plants", due: "2026-11-21", done: false, createdAt: "2026-11-20T10:00:00Z" },
    ]);
    expect(calls[0].url.pathname).toBe("/rest/v1/tasks");
  });

  it("creates with a trimmed title", async () => {
    const { fetcher, calls } = fakeRest(() => row);
    await repo(fetcher).create({ title: "  Water plants  ", due: "2026-11-21" });
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({ title: "Water plants", due: "2026-11-21" });
  });

  it("updates only the given fields, filtered by id", async () => {
    const { fetcher, calls } = fakeRest(() => [{ ...row, done: true }]);
    const t = await repo(fetcher).update(ID, { done: true });
    expect(t?.done).toBe(true);
    expect(calls[0].method).toBe("PATCH");
    expect(calls[0].body).toEqual({ done: true });
    expect(calls[0].url.searchParams.get("id")).toBe(`eq.${ID}`);
  });

  it("returns null / false for missing tasks", async () => {
    const { fetcher } = fakeRest(() => []);
    expect(await repo(fetcher).update(ID, { done: true })).toBeNull();
    expect(await repo(fetcher).remove(ID)).toBe(false);
  });

  it("doesn't query for ids that aren't UUIDs", async () => {
    const { fetcher, calls } = fakeRest(() => []);
    expect(await repo(fetcher).update("nope", { done: true })).toBeNull();
    expect(await repo(fetcher).remove("nope")).toBe(false);
    expect(calls).toHaveLength(0);
  });
});
