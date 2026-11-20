import type { FastifyPluginAsync } from "fastify";
import type { Sky, Weather } from "../../../shared/types.ts";
import { TtlCache, UpstreamError, getJson } from "../lib/cache.ts";

// Open-Meteo: free, no API key. https://open-meteo.com/en/docs
const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";

/** WMO weather codes → a sky bucket and a plain description. */
export function describeCode(code: number): { sky: Sky; description: string } {
  if (code === 0) return { sky: "clear", description: "clear" };
  if (code <= 2) return { sky: "partly", description: "partly cloudy" };
  if (code === 3) return { sky: "cloudy", description: "overcast" };
  if (code <= 48) return { sky: "fog", description: "foggy" };
  if (code <= 57) return { sky: "rain", description: "drizzling" };
  if (code <= 67) return { sky: "rain", description: "raining" };
  if (code <= 77) return { sky: "snow", description: "snowing" };
  if (code <= 82) return { sky: "rain", description: "showery" };
  if (code <= 86) return { sky: "snow", description: "snow showers" };
  return { sky: "storm", description: "stormy" };
}

interface GeoResponse {
  results?: { name: string; latitude: number; longitude: number; country_code?: string }[];
}
interface ForecastResponse {
  current: { temperature_2m: number; apparent_temperature: number; weather_code: number; is_day: number };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
}

export const weatherRoutes: FastifyPluginAsync<{ fetch: typeof fetch; defaultCity: string }> = async (
  app,
  { fetch: fetcher, defaultCity },
) => {
  const cache = new TtlCache<Weather>(10 * 60 * 1000);

  app.get<{ Querystring: { city?: string } }>("/", async (req, reply) => {
    const city = (req.query.city ?? defaultCity).trim();
    const key = city.toLowerCase();
    const cached = cache.get(key);
    if (cached) return cached;

    try {
      const geo = await getJson<GeoResponse>(fetcher, `${GEO}?name=${encodeURIComponent(city)}&count=1`);
      const place = geo.results?.[0];
      if (!place) return reply.code(404).send({ error: `Couldn't find a place called "${city}".` });

      const params = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current: "temperature_2m,apparent_temperature,weather_code,is_day",
        hourly: "temperature_2m,weather_code",
        daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        timezone: "auto",
        forecast_days: "2",
      });
      const f = await getJson<ForecastResponse>(fetcher, `${FORECAST}?${params}`);

      // Next 8 hours, starting from the current local hour.
      const nowIdx = Math.max(
        0,
        f.hourly.time.findIndex((t) => t.slice(0, 13) >= new Date().toISOString().slice(0, 13)),
      );
      const hours = f.hourly.time.slice(nowIdx, nowIdx + 8).map((time, i) => ({
        time,
        temperature: Math.round(f.hourly.temperature_2m[nowIdx + i]),
        sky: describeCode(f.hourly.weather_code[nowIdx + i]).sky,
      }));

      const now = describeCode(f.current.weather_code);
      const weather: Weather = {
        place: place.name,
        temperature: Math.round(f.current.temperature_2m),
        feelsLike: Math.round(f.current.apparent_temperature),
        description: now.description,
        sky: now.sky,
        isDay: f.current.is_day === 1,
        high: Math.round(f.daily.temperature_2m_max[0]),
        low: Math.round(f.daily.temperature_2m_min[0]),
        precipitationChance: f.daily.precipitation_probability_max[0] ?? 0,
        hours,
      };
      cache.set(key, weather);
      return weather;
    } catch (err) {
      if (err instanceof UpstreamError) return reply.code(502).send({ error: `Weather is unavailable: ${err.message}.` });
      throw err;
    }
  });
};
