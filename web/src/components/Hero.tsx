import { useState, type FormEvent } from "react";
import type { Task, Weather } from "../../../shared/types.ts";
import type { Load } from "../hooks/useLoad.ts";
import { bucketFor, greeting } from "../dates.ts";

interface Props {
  weather: Load<Weather>;
  tasks: Load<Task[]>;
  onCityChange: (city: string) => void;
}

export function Hero({ weather, tasks, onCityChange }: Props) {
  const [editing, setEditing] = useState(false);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  const dueToday =
    tasks.status === "ready"
      ? tasks.data.filter((t) => !t.done && ["Today", "Overdue"].includes(bucketFor(t.due))).length
      : null;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get("city")?.toString().trim();
    if (value) onCityChange(value);
    setEditing(false);
  }

  const place = weather.status === "ready" ? weather.data.place : "your city";
  const placeControl = editing ? (
    <form className="city-form" onSubmit={submit}>
      <label className="visually-hidden" htmlFor="city">City</label>
      <input id="city" name="city" defaultValue={weather.status === "ready" ? place : ""} autoFocus
        onBlur={() => setEditing(false)} onKeyDown={(e) => e.key === "Escape" && setEditing(false)} />
    </form>
  ) : (
    <button className="place" onClick={() => setEditing(true)} title="Change city">{place}</button>
  );

  return (
    <header className="hero">
      <h1 className="sentence">
        {greeting()}.{" "}
        {weather.status === "ready" ? (
          <>
            It’s {weather.data.temperature}° and {weather.data.description} in {placeControl}.
          </>
        ) : weather.status === "loading" ? (
          <span className="faint">Checking the sky…</span>
        ) : (
          <span className="faint">No weather for {placeControl} right now.</span>
        )}
      </h1>
      <p className="subline">
        {today}.{" "}
        {weather.status === "ready" &&
          `High ${weather.data.high}°, low ${weather.data.low}°, ${weather.data.precipitationChance}% chance of rain. `}
        {dueToday !== null && (dueToday === 0 ? "Nothing due today." : `${dueToday} ${dueToday === 1 ? "task" : "tasks"} due today.`)}
      </p>
      {weather.status === "error" && <p className="note">{weather.message}</p>}
    </header>
  );
}
