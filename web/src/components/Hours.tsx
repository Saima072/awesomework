import type { Sky, Weather } from "../../../shared/types.ts";

const glyph: Record<Sky, string> = {
  clear: "☀", partly: "⛅", cloudy: "☁", fog: "🌫", rain: "🌧", snow: "❄", storm: "⛈",
};

export function Hours({ weather }: { weather: Weather }) {
  return (
    <section className="rail-block" aria-labelledby="hours-heading">
      <h2 id="hours-heading">Next hours</h2>
      <ol className="hours">
        {weather.hours.map((h, i) => (
          <li key={h.time}>
            <span className="hour">{i === 0 ? "Now" : h.time.slice(11, 13)}</span>
            <span className="glyph" aria-label={h.sky}>{glyph[h.sky]}</span>
            <span className="temp">{h.temperature}°</span>
          </li>
        ))}
      </ol>
      <p className="muted small">Feels like {weather.feelsLike}°.</p>
    </section>
  );
}
