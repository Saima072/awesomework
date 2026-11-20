import { useEffect, useMemo, useState } from "react";
import type { Backdrop as BackdropImage } from "../../../shared/types.ts";
import { api } from "../api.ts";
import { useLoad } from "../hooks/useLoad.ts";

function prefersReducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Loads the photo list and picks one at random; `next` moves to another. */
export function useBackdrop() {
  const [state] = useLoad(api.backgrounds);
  const images = useMemo(() => {
    if (state.status !== "ready") return [];
    // Animated GIFs are skipped for people who ask for reduced motion.
    return prefersReducedMotion() ? state.data.filter((b) => !b.animated) : state.data;
  }, [state]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length) setIndex(Math.floor(Math.random() * images.length));
  }, [images]);

  const current: BackdropImage | null = images[index] ?? null;
  const next = images.length > 1 ? () => setIndex((i) => (i + 1) % images.length) : null;
  const error = state.status === "error" ? state.message : null;
  return { current, next, error };
}

type Props = ReturnType<typeof useBackdrop>;

export function Backdrop({ current }: Props) {
  const [loaded, setLoaded] = useState<string | null>(null);
  if (!current) return null;
  return (
    <div className="backdrop" aria-hidden="true">
      <img
        key={current.url}
        src={current.url}
        alt=""
        className={loaded === current.url ? "shown" : undefined}
        onLoad={() => setLoaded(current.url)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

Backdrop.Credit = function Credit({ current, next, error }: Props) {
  if (error) return <footer className="credit">{error}</footer>;
  if (!current) return null;
  const who = current.pageUrl ? (
    <a href={current.pageUrl} target="_blank" rel="noreferrer">{current.credit}</a>
  ) : (
    current.credit
  );
  return (
    <footer className="credit">
      Background photo: {who}
      {current.license && `, ${current.license}`}.{" "}
      {next && (
        <button className="link" onClick={next}>
          Next photo
        </button>
      )}
    </footer>
  );
};
