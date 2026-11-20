// Shapes of the data the API returns. Imported (type-only) by both server and web.

export interface Task {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) or null when there's no deadline */
  due: string | null;
  done: boolean;
  createdAt: string;
}

export interface NewTask {
  title: string;
  due?: string | null;
}

export interface TaskPatch {
  title?: string;
  due?: string | null;
  done?: boolean;
}

export type Sky = "clear" | "partly" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export interface Weather {
  place: string;
  temperature: number;
  feelsLike: number;
  description: string;
  sky: Sky;
  isDay: boolean;
  high: number;
  low: number;
  precipitationChance: number;
  hours: { time: string; temperature: number; sky: Sky }[];
}

export interface NewsItem {
  headline: string;
  url: string | null;
  source: string;
}

export interface Fact {
  text: string;
  source: string;
}

export interface ApiError {
  error: string;
}

export interface Backdrop {
  url: string;
  /** Link to the image's page (license and full details), when known */
  pageUrl: string | null;
  credit: string;
  license: string | null;
  animated: boolean;
}
