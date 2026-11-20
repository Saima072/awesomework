import { api } from "../api.ts";
import { useLoad } from "../hooks/useLoad.ts";

export function FunFact() {
  const [state, reload] = useLoad(api.fact);
  return (
    <section className="rail-block" aria-labelledby="fact-heading" aria-busy={state.status === "loading"}>
      <h2 id="fact-heading">Did you know?</h2>
      {state.status === "loading" && <p className="muted">Digging one up…</p>}
      {state.status === "error" && <p className="muted">{state.message}</p>}
      {state.status === "ready" && <p className="reading fact">{state.data.text}</p>}
      <button className="quiet" onClick={reload}>Another fact</button>
    </section>
  );
}
