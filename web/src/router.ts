import { useEffect, useState } from "react";

export const ROUTES = { today: "/", photos: "/photos" } as const;

/** Current path, kept in sync with back/forward navigation. */
export function usePath(): string {
  const [path, setPath] = useState(() => location.pathname);
  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);
  return path;
}

export function navigate(to: string) {
  if (to === location.pathname) return;
  history.pushState(null, "", to);
  dispatchEvent(new PopStateEvent("popstate"));
  scrollTo(0, 0);
}
