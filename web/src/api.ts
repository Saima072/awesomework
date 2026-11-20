import type { Fact, NewTask, NewsItem, Task, TaskPatch, Weather } from "../../shared/types.ts";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? body?.message ?? `Request failed (${res.status}).`);
  return body as T;
}

export const api = {
  tasks: () => request<Task[]>("/tasks"),
  createTask: (t: NewTask) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(t) }),
  updateTask: (id: string, p: TaskPatch) => request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(p) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
  weather: (city: string) => request<Weather>(`/weather?city=${encodeURIComponent(city)}`),
  news: () => request<NewsItem>("/news"),
  fact: () => request<Fact>("/fact"),
};
