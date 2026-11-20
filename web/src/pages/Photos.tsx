import { useEffect, useRef, useState } from "react";
import type { Backdrop as Photo } from "../../../shared/types.ts";
import type { Load } from "../hooks/useLoad.ts";

/** Commons thumbnails come in standard widths; swap the 1920px one for smaller sizes in the grid. */
function sized(url: string, width: number): string {
  return url.includes("/thumb/") ? url.replace(/\/1920px-/, `/${width}px-`) : url;
}

function Credit({ photo }: { photo: Photo }) {
  return (
    <>
      {photo.pageUrl ? (
        <a href={photo.pageUrl} target="_blank" rel="noreferrer">{photo.credit}</a>
      ) : (
        photo.credit
      )}
      {photo.license && `, ${photo.license}`}
    </>
  );
}

export function Photos({ photos }: { photos: Load<Photo[]> }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const list = photos.status === "ready" ? photos.data : [];

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + list.length) % list.length));
  const current = open !== null ? list[open] : null;

  return (
    <main className="photos-page">
      <header className="photos-head">
        <h1>Joe Jonas</h1>
        <p>
          {photos.status === "ready"
            ? `${list.length} freely licensed photos from Wikimedia Commons. Select a photo to see it larger.`
            : photos.status === "loading"
              ? "Loading photos…"
              : photos.message}
        </p>
      </header>

      {photos.status === "ready" && list.length === 0 && <p className="muted">No photos were found.</p>}

      <ul className="gallery">
        {list.map((p, i) => (
          <li key={p.url}>
            <button className="thumb" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${list.length}, by ${p.credit}`}>
              <img
                src={sized(p.url, 500)}
                srcSet={p.url.includes("/thumb/") ? `${sized(p.url, 500)} 500w, ${sized(p.url, 960)} 960w` : undefined}
                sizes="(max-width: 600px) 100vw, 360px"
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            </button>
            <p className="caption"><Credit photo={p} /></p>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Photo viewer"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
      >
        {current && (
          <figure>
            <img src={current.url} alt={`Photo ${open! + 1} of ${list.length}`} referrerPolicy="no-referrer" />
            <figcaption>
              <span>
                {open! + 1} of {list.length}. Photo: <Credit photo={current} />.
              </span>
              <span className="lightbox-actions">
                <button onClick={() => step(-1)}>Previous</button>
                <button onClick={() => step(1)}>Next</button>
                <button onClick={() => setOpen(null)} autoFocus>Close</button>
              </span>
            </figcaption>
          </figure>
        )}
      </dialog>
    </main>
  );
}
