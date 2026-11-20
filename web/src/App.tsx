import { useEffect, useState } from "react";
import { api } from "./api.ts";
import { useLoad } from "./hooks/useLoad.ts";
import { Hero } from "./components/Hero.tsx";
import { Tasks } from "./components/Tasks.tsx";
import { Hours } from "./components/Hours.tsx";
import { News } from "./components/News.tsx";
import { FunFact } from "./components/FunFact.tsx";

function readCity(): string {
  try {
    return localStorage.getItem("city") ?? "";
  } catch {
    return "";
  }
}

export function App() {
  const [city, setCity] = useState(readCity);
  const [weather] = useLoad(() => api.weather(city), [city]);
  const [tasks, reloadTasks, mutateTasks] = useLoad(api.tasks);

  useEffect(() => {
    try {
      if (city) localStorage.setItem("city", city);
    } catch {
      /* storage unavailable; the city just won't be remembered */
    }
  }, [city]);

  const sky = weather.status === "ready" ? weather.data.sky : "pending";
  const time = weather.status === "ready" && !weather.data.isDay ? "night" : "day";

  return (
    <div className="page" data-sky={sky} data-time={time}>
      <main className="layout">
        <Hero weather={weather} tasks={tasks} onCityChange={setCity} />
        <Tasks state={tasks} reload={reloadTasks} mutate={mutateTasks} />
        <aside className="rail" aria-label="Weather, news and a fun fact">
          {weather.status === "ready" && <Hours weather={weather.data} />}
          <News />
          <FunFact />
        </aside>
      </main>
    </div>
  );
}
