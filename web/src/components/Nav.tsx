import type { MouseEvent } from "react";
import { ROUTES, navigate } from "../router.ts";

const LINKS = [
  { to: ROUTES.today, label: "Today" },
  { to: ROUTES.photos, label: "Photos" },
];

export function Nav({ path }: { path: string }) {
  function go(e: MouseEvent<HTMLAnchorElement>, to: string) {
    // Let people open links in a new tab with modifier keys.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(to);
  }
  return (
    <nav className="nav" aria-label="Main">
      {LINKS.map((l) => (
        <a key={l.to} href={l.to} aria-current={path === l.to ? "page" : undefined} onClick={(e) => go(e, l.to)}>
          {l.label}
        </a>
      ))}
    </nav>
  );
}
