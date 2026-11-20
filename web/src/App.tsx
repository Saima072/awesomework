import { useEffect, useState } from "react";
import { api } from "./api.ts";
import { useLoad } from "./hooks/useLoad.ts";
import { useBackdrop } from "./components/Backdrop.tsx";
import { Nav } from "./components/Nav.tsx";
import { Today } from "./pages/Today.tsx";
import { Photos } from "./pages/Photos.tsx";
import { ROUTES, usePath } from "./router.ts";

function readCity(): string {
  try {
    return localStorage.getItem("city") ?? "";
  } catch {
    return "";
  }
}

export function App() {
  const path = usePath();
  const [city, setCity] = useState(readCity);
  const [weather] = useLoad(() => api.weather(city), [city]);
  const [tasks, reloadTasks, mutateTasks] = useLoad(api.tasks);
  const backdrop = useBackdrop();
  const onPhotos = path === ROUTES.photos;

  useEffect(() => {
    try {
      if (city) localStorage.setItem("city", city);
    } catch {
      /* storage unavailable; the city just won't be remembered */
    }
  }, [city]);

  useEffect(() => {
    document.title = onPhotos ? "Joe Jonas photos" : "Today";
  }, [onPhotos]);

  const sky = weather.status === "ready" ? weather.data.sky : "pending";
  const time = weather.status === "ready" && !weather.data.isDay ? "night" : "day";
  const withPhoto = !onPhotos && backdrop.current.length > 0;

  return (
    <div className="page" data-sky={sky} data-time={time} data-photo={withPhoto ? "" : undefined}>
      <Nav path={onPhotos ? ROUTES.photos : ROUTES.today} />
      {onPhotos ? (
        <Photos photos={backdrop.all} />
      ) : (
        <Today
          weather={weather}
          onCityChange={setCity}
          tasks={tasks}
          reloadTasks={reloadTasks}
          mutateTasks={mutateTasks}
          backdrop={backdrop}
        />
      )}
    </div>
  );
}
