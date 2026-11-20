import { useCallback, useEffect, useState } from "react";

export type Load<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

/** Runs `fn` on mount and whenever `deps` change; `reload` runs it again on demand. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => (s.status === "ready" ? s : { status: "loading" }));
    fn().then(
      (data) => alive && setState({ status: "ready", data }),
      (err: Error) => alive && setState({ status: "error", message: err.message }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  /** Update already-loaded data locally (for instant, optimistic UI). */
  const mutate = useCallback(
    (update: (data: T) => T) => setState((s) => (s.status === "ready" ? { status: "ready", data: update(s.data) } : s)),
    [],
  );
  return [state, reload, mutate] as const;
}
