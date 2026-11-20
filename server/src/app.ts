import Fastify, { type FastifyServerOptions } from "fastify";
import { InMemoryTaskRepository, type TaskRepository } from "./lib/taskRepository.ts";
import { taskRoutes } from "./routes/tasks.ts";
import { weatherRoutes } from "./routes/weather.ts";
import { newsRoutes } from "./routes/news.ts";
import { factRoutes } from "./routes/fact.ts";

export interface AppDeps {
  tasks?: TaskRepository;
  /** Swappable for tests; defaults to the global fetch */
  fetch?: typeof fetch;
  defaultCity?: string;
}

export function buildApp(opts: FastifyServerOptions = {}, deps: AppDeps = {}) {
  const app = Fastify(opts);
  const tasks = deps.tasks ?? InMemoryTaskRepository.withSampleData();
  const fetcher = deps.fetch ?? fetch;
  const defaultCity = deps.defaultCity ?? process.env.DEFAULT_CITY ?? "Berlin";

  app.get("/api/health", async () => ({ ok: true }));
  app.register(taskRoutes, { prefix: "/api/tasks", tasks });
  app.register(weatherRoutes, { prefix: "/api/weather", fetch: fetcher, defaultCity });
  app.register(newsRoutes, { prefix: "/api/news", fetch: fetcher });
  app.register(factRoutes, { prefix: "/api/fact", fetch: fetcher });

  return app;
}
