import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { InMemoryTaskRepository } from "../src/lib/taskRepository.js";
import { describeCode, } from "../src/routes/weather.js";
import { stripHtml } from "../src/routes/news.js";

/** Fake fetch that answers by URL substring. */
function fakeFetch(routes: Record<string, unknown>): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = String(input);
    const key = Object.keys(routes).find((k) => url.includes(k));
    if (!key) throw new TypeError("network down");
    return new Response(JSON.stringify(routes[key]), { status: 200 });
  }) as typeof fetch;
}

describe("tasks", () => {
  const app = () => buildApp({}, { tasks: new InMemoryTaskRepository() });

  it("creates, updates, lists and deletes a task", async () => {
    const a = app();
    const created = await a.inject({ method: "POST", url: "/api/tasks", payload: { title: "  Water plants ", due: "2026-11-21" } });
    expect(created.statusCode).toBe(201);
    const task = created.json();
    expect(task).toMatchObject({ title: "Water plants", due: "2026-11-21", done: false });

    const patched = await a.inject({ method: "PATCH", url: `/api/tasks/${task.id}`, payload: { done: true } });
    expect(patched.json().done).toBe(true);

    expect((await a.inject("/api/tasks")).json()).toHaveLength(1);
    expect((await a.inject({ method: "DELETE", url: `/api/tasks/${task.id}` })).statusCode).toBe(204);
    expect((await a.inject("/api/tasks")).json()).toHaveLength(0);
  });

  it("rejects blank titles and bad dates", async () => {
    const a = app();
    expect((await a.inject({ method: "POST", url: "/api/tasks", payload: { title: "   " } })).statusCode).toBe(400);
    expect((await a.inject({ method: "POST", url: "/api/tasks", payload: { title: "x", due: "tomorrow" } })).statusCode).toBe(400);
  });

  it("returns 404 for unknown ids", async () => {
    const res = await app().inject({ method: "PATCH", url: "/api/tasks/nope", payload: { done: true } });
    expect(res.statusCode).toBe(404);
  });
});

describe("weather", () => {
  const forecast = {
    current: { temperature_2m: 6.6, apparent_temperature: 3.2, weather_code: 61, is_day: 1 },
    hourly: {
      time: Array.from({ length: 48 }, (_, i) => new Date(Date.now() + (i - 2) * 3600e3).toISOString().slice(0, 13) + ":00"),
      temperature_2m: Array.from({ length: 48 }, (_, i) => i),
      weather_code: Array.from({ length: 48 }, () => 3),
    },
    daily: { temperature_2m_max: [9.4], temperature_2m_min: [2.1], precipitation_probability_max: [70] },
  };

  it("combines geocoding and forecast", async () => {
    const app = buildApp({}, {
      tasks: new InMemoryTaskRepository(),
      fetch: fakeFetch({ "geocoding-api": { results: [{ name: "Berlin", latitude: 52.5, longitude: 13.4 }] }, forecast }),
    });
    const res = await app.inject("/api/weather?city=Berlin");
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ place: "Berlin", temperature: 7, feelsLike: 3, sky: "rain", high: 9, low: 2 });
    expect(res.json().hours).toHaveLength(8);
  });

  it("explains when the upstream is unreachable", async () => {
    const app = buildApp({}, { tasks: new InMemoryTaskRepository(), fetch: fakeFetch({}) });
    const res = await app.inject("/api/weather");
    expect(res.statusCode).toBe(502);
    expect(res.json().error).toMatch(/Weather is unavailable/);
  });

  it("maps WMO codes", () => {
    expect(describeCode(0).sky).toBe("clear");
    expect(describeCode(75).sky).toBe("snow");
    expect(describeCode(95).sky).toBe("storm");
  });
});

describe("news and facts", () => {
  it("returns a cleaned-up news story", async () => {
    const app = buildApp({}, {
      tasks: new InMemoryTaskRepository(),
      fetch: fakeFetch({ featured: { news: [{ story: "<!--Nov 20--><b>A</b> &amp; B happened.", links: [] }] } }),
    });
    expect((await app.inject("/api/news")).json()).toMatchObject({ headline: "A & B happened.", url: null });
  });

  it("returns a fun fact", async () => {
    const app = buildApp({}, { tasks: new InMemoryTaskRepository(), fetch: fakeFetch({ uselessfacts: { text: "Otters hold hands. " } }) });
    expect((await app.inject("/api/fact")).json().text).toBe("Otters hold hands.");
  });

  it("strips html", () => {
    expect(stripHtml("<a href='x'>Hi</a>&nbsp;there")).toBe("Hi there");
  });
});

describe("vercel adapter", async () => {
  const { restoreUrl } = await import("../src/vercel.js");
  it("restores the original API path", () => {
    expect(restoreUrl("/api?__path=tasks")).toBe("/api/tasks");
    expect(restoreUrl("/api?__path=tasks/abc")).toBe("/api/tasks/abc");
    expect(restoreUrl("/api?city=Oslo&__path=weather")).toBe("/api/weather?city=Oslo");
    expect(restoreUrl("/api/tasks")).toBe("/api/tasks");
  });
});
