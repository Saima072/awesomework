import { randomUUID } from "node:crypto";
import type { NewTask, Task, TaskPatch } from "../../../shared/types.js";

/**
 * Storage boundary for tasks. The app only talks to this interface, so swapping the
 * in-memory version for a real database means writing one new class.
 */
export interface TaskRepository {
  list(): Promise<Task[]>;
  create(input: NewTask): Promise<Task>;
  update(id: string, patch: TaskPatch): Promise<Task | null>;
  remove(id: string): Promise<boolean>;
}

export class InMemoryTaskRepository implements TaskRepository {
  private tasks = new Map<string, Task>();

  static withSampleData(today = new Date()): InMemoryTaskRepository {
    const repo = new InMemoryTaskRepository();
    const day = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    const seed: NewTask[] = [
      { title: "Book dentist appointment", due: day(0) },
      { title: "Reply to Amira about the weekend", due: day(0) },
      { title: "Pick up parcel from the post office", due: day(1) },
      { title: "Renew library books", due: day(3) },
      { title: "Plan next week's meals", due: day(5) },
      { title: "Try the new bakery on the corner", due: null },
    ];
    for (const t of seed) repo.insert(t);
    return repo;
  }

  private insert(input: NewTask): Task {
    const task: Task = {
      id: randomUUID(),
      title: input.title.trim(),
      due: input.due ?? null,
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async list() {
    return [...this.tasks.values()];
  }

  async create(input: NewTask) {
    return this.insert(input);
  }

  async update(id: string, patch: TaskPatch) {
    const current = this.tasks.get(id);
    if (!current) return null;
    const next: Task = {
      ...current,
      ...(patch.title !== undefined && { title: patch.title.trim() }),
      ...(patch.due !== undefined && { due: patch.due }),
      ...(patch.done !== undefined && { done: patch.done }),
    };
    this.tasks.set(id, next);
    return next;
  }

  async remove(id: string) {
    return this.tasks.delete(id);
  }
}
