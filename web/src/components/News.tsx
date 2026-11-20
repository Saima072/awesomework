import { api } from "../api.ts";
import { useLoad } from "../hooks/useLoad.ts";

export function News() {
  const [state, reload] = useLoad(api.news);
  return (
    <section className="rail-block" aria-labelledby="news-heading" aria-busy={state.status === "loading"}>
      <h2 id="news-heading">In the news</h2>
      {state.status === "loading" && <p className="muted">Finding a story…</p>}
      {state.status === "error" && <p className="muted">{state.message}</p>}
      {state.status === "ready" && (
        <>
          <p className="reading">{state.data.headline}</p>
          <p className="small muted">
            {state.data.url ? <a href={state.data.url} target="_blank" rel="noreferrer">Read on Wikipedia</a> : state.data.source}
          </p>
        </>
      )}
      <button className="quiet" onClick={reload}>Another story</button>
    </section>
  );
}
