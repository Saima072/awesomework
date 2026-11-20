/** Local-date helpers. Task due dates are plain YYYY-MM-DD strings. */
export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysFromToday(iso: string, today = new Date()): number {
  const [y, m, d] = iso.split("-").map(Number);
  const due = new Date(y, m - 1, d);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due.getTime() - start.getTime()) / 86_400_000);
}

export type Bucket = "Overdue" | "Today" | "Tomorrow" | "This week" | "Later" | "Someday";
export const BUCKETS: Bucket[] = ["Overdue", "Today", "Tomorrow", "This week", "Later", "Someday"];

export function bucketFor(due: string | null): Bucket {
  if (!due) return "Someday";
  const n = daysFromToday(due);
  if (n < 0) return "Overdue";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  if (n < 7) return "This week";
  return "Later";
}

export function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
