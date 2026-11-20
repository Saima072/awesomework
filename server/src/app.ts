import Fastify, { type FastifyServerOptions } from "fastify";
import { InMemoryTaskRepository, type TaskRepository } from "./lib/taskRepository.js";
import { SupabaseTaskRepository } from "./lib/supabaseTaskRepository.js";
import { taskRoutes } from "./routes/tasks.js";
import { weatherRoutes } from "./routes/weather.js";
import { newsRoutes } from "./routes/news.js";
import { factRoutes } from "./routes/fact.js";

export interface AppDeps {
  tasks?: TaskRepository;
  /** Swappable for tests; defaults to the global fetch */
  fetch?: typeof fetch;
  defaultCity?: string;
}

export function buildApp(opts: FastifyServerOptions = {}, deps: AppDeps = {}) {
  const app = Fastify(opts);
  const tasks = deps.tasks ?? defaultTaskRepository(app.log);
  const fetcher = deps.fetch ?? fetch;
  const defaultCity = deps.defaultCity ?? process.env.DEFAULT_CITY ?? "Berlin";

  app.get("/api/health", async () => ({ ok: true }));
  app.register(taskRoutes, { prefix: "/api/tasks", tasks });
  app.register(weatherRoutes, { prefix: "/api/weather", fetch: fetcher, defaultCity });
  app.register(newsRoutes, { prefix: "/api/news", fetch: fetcher });
  app.register(factRoutes, { prefix: "/api/fact", fetch: fetcher });

  return app;
}

/** Supabase when its URL and secret key are configured, otherwise an in-memory list with sample tasks. */
function defaultTaskRepository(log: { info: (msg: string) => void }): TaskRepository {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (url && key) {
    log.info("Storing tasks in Supabase");
    return new SupabaseTaskRepository(url, key);
  }
  log.info("SUPABASE_URL / SUPABASE_SECRET_KEY not set: storing tasks in memory (they reset on restart)");
  return InMemoryTaskRepository.withSampleData();
}
