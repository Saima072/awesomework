import { useState, type FormEvent } from "react";
import type { Task } from "../../../shared/types.ts";
import { api } from "../api.ts";
import type { Load } from "../hooks/useLoad.ts";
import { BUCKETS, bucketFor, shortDate } from "../dates.ts";

interface Props {
  state: Load<Task[]>;
  reload: () => void;
  mutate: (update: (tasks: Task[]) => Task[]) => void;
}

export function Tasks({ state, reload, mutate }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
      reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  /** Show the change immediately; if saving fails, show why and reload the real list. */
  async function optimistic(update: (tasks: Task[]) => Task[], action: () => Promise<unknown>) {
    setError(null);
    mutate(update);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
      reload();
    }
  }

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = data.get("title")?.toString().trim();
    if (!title) return;
    const due = data.get("due")?.toString() || null;
    setBusy(true);
    await run(() => api.createTask({ title, due }));
    setBusy(false);
    form.reset();
    form.querySelector<HTMLInputElement>("input[name=title]")?.focus();
  }

  return (
    <section className="sheet" aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">Upcoming</h2>

      <form className="add" onSubmit={add}>
        <label className="visually-hidden" htmlFor="new-title">New task</label>
        <input id="new-title" name="title" placeholder="Add a task" maxLength={200} autoComplete="off" />
        <label className="visually-hidden" htmlFor="new-due">Due date</label>
        <input id="new-due" name="due" type="date" />
        <button type="submit" disabled={busy}>Add</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {state.status === "loading" && <p className="muted">Loading your tasks…</p>}
      {state.status === "error" && (
        <p className="error" role="alert">
          {state.message} <button className="link" onClick={reload}>Try again</button>
        </p>
      )}
      {state.status === "ready" && state.data.length === 0 && (
        <p className="muted">Your list is clear. Add something you want to get done.</p>
      )}
      {state.status === "ready" &&
        BUCKETS.map((bucket) => {
          const items = state.data
            .filter((t) => bucketFor(t.due) === bucket)
            .sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? "").localeCompare(b.due ?? ""));
          if (items.length === 0) return null;
          return (
            <div key={bucket} className="group" data-bucket={bucket}>
              <h3>{bucket}</h3>
              <ul>
                {items.map((t) => (
                  <li key={t.id} className={t.done ? "done" : undefined}>
                    <input
                      type="checkbox"
                      id={`t-${t.id}`}
                      checked={t.done}
                      onChange={() =>
                        optimistic(
                          (all) => all.map((x) => (x.id === t.id ? { ...x, done: !t.done } : x)),
                          () => api.updateTask(t.id, { done: !t.done }),
                        )
                      }
                    />
                    <label htmlFor={`t-${t.id}`}>{t.title}</label>
                    <span className="due">{t.due && bucket !== "Today" && bucket !== "Tomorrow" ? shortDate(t.due) : ""}</span>
                    <button className="remove" aria-label={`Delete “${t.title}”`} onClick={() => optimistic((all) => all.filter((x) => x.id !== t.id), () => api.deleteTask(t.id))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </section>
  );
}
