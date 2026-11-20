import type { Task, Weather } from "../../../shared/types.ts";
import type { Load } from "../hooks/useLoad.ts";
import { Hero } from "../components/Hero.tsx";
import { Tasks } from "../components/Tasks.tsx";
import { Hours } from "../components/Hours.tsx";
import { News } from "../components/News.tsx";
import { FunFact } from "../components/FunFact.tsx";
import { Backdrop, type BackdropState } from "../components/Backdrop.tsx";

interface Props {
  weather: Load<Weather>;
  onCityChange: (city: string) => void;
  tasks: Load<Task[]>;
  reloadTasks: () => void;
  mutateTasks: (update: (tasks: Task[]) => Task[]) => void;
  backdrop: BackdropState;
}

export function Today({ weather, onCityChange, tasks, reloadTasks, mutateTasks, backdrop }: Props) {
  return (
    <>
      <Backdrop {...backdrop} />
      <main className="layout">
        <Hero weather={weather} tasks={tasks} onCityChange={onCityChange} />
        <Tasks state={tasks} reload={reloadTasks} mutate={mutateTasks} />
        <aside className="rail" aria-label="Weather, news and a fun fact">
          {weather.status === "ready" && <Hours weather={weather.data} />}
          <News />
          <FunFact />
        </aside>
      </main>
      <Backdrop.Credit {...backdrop} />
    </>
  );
}
