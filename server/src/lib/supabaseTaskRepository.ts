import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NewTask, Task, TaskPatch } from "../../../shared/types.ts";
import type { TaskRepository } from "./taskRepository.ts";

interface Row {
  id: string;
  title: string;
  due: string | null;
  done: boolean;
  created_at: string;
}

const toTask = (r: Row): Task => ({ id: r.id, title: r.title, due: r.due, done: r.done, createdAt: r.created_at });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Tasks stored in the Supabase `public.tasks` table.
 * Uses the secret key, which bypasses row-level security, so it must only ever run on the server.
 */
export class SupabaseTaskRepository implements TaskRepository {
  private db: SupabaseClient;

  constructor(url: string, secretKey: string, fetcher?: typeof fetch) {
    this.db = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: fetcher ? { fetch: fetcher } : undefined,
    });
  }

  async list() {
    const { data, error } = await this.db.from("tasks").select("*").order("created_at");
    if (error) throw new Error(`Couldn't load tasks: ${error.message}`);
    return (data as Row[]).map(toTask);
  }

  async create(input: NewTask) {
    const { data, error } = await this.db
      .from("tasks")
      .insert({ title: input.title.trim(), due: input.due ?? null })
      .select()
      .single();
    if (error) throw new Error(`Couldn't save the task: ${error.message}`);
    return toTask(data as Row);
  }

  async update(id: string, patch: TaskPatch) {
    if (!UUID.test(id)) return null;
    const changes: Partial<Row> = {};
    if (patch.title !== undefined) changes.title = patch.title.trim();
    if (patch.due !== undefined) changes.due = patch.due;
    if (patch.done !== undefined) changes.done = patch.done;
    const { data, error } = await this.db.from("tasks").update(changes).eq("id", id).select().maybeSingle();
    if (error) throw new Error(`Couldn't update the task: ${error.message}`);
    return data ? toTask(data as Row) : null;
  }

  async remove(id: string) {
    if (!UUID.test(id)) return false;
    const { data, error } = await this.db.from("tasks").delete().eq("id", id).select("id");
    if (error) throw new Error(`Couldn't delete the task: ${error.message}`);
    return (data ?? []).length > 0;
  }
}
