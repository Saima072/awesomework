import { useEffect, useMemo, useState } from "react";
import type { Backdrop as BackdropImage } from "../../../shared/types.ts";
import { api } from "../api.ts";
import { useLoad } from "../hooks/useLoad.ts";

const PER_VIEW = 3;

function prefersReducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Loads the photo list, shuffles it, and shows three at a time; `next` moves to the next three. */
export function useBackdrop() {
  const [state] = useLoad(api.backgrounds);
  const images = useMemo(() => {
    if (state.status !== "ready") return [];
    // Animated GIFs are skipped for people who ask for reduced motion.
    return shuffle(prefersReducedMotion() ? state.data.filter((b) => !b.animated) : state.data);
  }, [state]);
  const [start, setStart] = useState(0);
  useEffect(() => setStart(0), [images]);

  const count = Math.min(PER_VIEW, images.length);
  const current: BackdropImage[] = Array.from({ length: count }, (_, i) => images[(start + i) % images.length]);
  const next = images.length > PER_VIEW ? () => setStart((s) => (s + PER_VIEW) % images.length) : null;
  const error = state.status === "error" ? state.message : null;
  return { current, next, error };
}

type Props = ReturnType<typeof useBackdrop>;

export function Backdrop({ current }: Props) {
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set());
  if (current.length === 0) return null;
  return (
    <div className="backdrop" aria-hidden="true" style={{ ["--panels" as string]: current.length }}>
      {current.map((img) => (
        <img
          key={img.url}
          src={img.url}
          alt=""
          className={loaded.has(img.url) ? "shown" : undefined}
          onLoad={() => setLoaded((s) => new Set(s).add(img.url))}
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  );
}

Backdrop.Credit = function Credit({ current, next, error }: Props) {
  if (error) return <footer className="credit">{error}</footer>;
  if (current.length === 0) return null;
  return (
    <footer className="credit">
      Background photos:{" "}
      {current.map((img, i) => (
        <span key={img.url}>
          {i > 0 && "; "}
          {img.pageUrl ? (
            <a href={img.pageUrl} target="_blank" rel="noreferrer">{img.credit}</a>
          ) : (
            img.credit
          )}
          {img.license && ` (${img.license})`}
        </span>
      ))}
      .{" "}
      {next && (
        <button className="link" onClick={next}>
          Next photos
        </button>
      )}
    </footer>
  );
};
