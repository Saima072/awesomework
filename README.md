# awesomework

A personal start page: your upcoming tasks, the weather outside, a story from today's news and a fun fact. The page background takes on the color of the actual sky (rain, clear, snow, night…).

## Stack

| Part | Tech |
| --- | --- |
| Frontend (`web/`) | React 19, TypeScript, Vite 6, plain CSS |
| Backend (`server/`) | Node, Fastify 5, TypeScript (run with `tsx`) |
| Shared types (`shared/`) | API response shapes, used by both sides |
| Data sources | [Open-Meteo](https://open-meteo.com) (weather), Wikipedia "In the news" feed, [uselessfacts](https://uselessfacts.jsph.pl): all free, no API keys |
| Tasks storage | In memory for now (resets on restart); see *Database* below |

## Run it

Needs Node 20.6 or newer.

```bash
npm install
cp .env.example .env   # optional: set DEFAULT_CITY and PORT
npm run dev            # API on :3001, web app on :5173
```

Open http://localhost:5173. Click the city name in the headline to change it; your choice is remembered in the browser.

Other scripts: `npm test` (API tests), `npm run typecheck`, `npm run build` (type checks the API, builds the web app into `web/dist`).

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Add a task `{ title, due? }` (`due` is `YYYY-MM-DD` or null) |
| PATCH | `/api/tasks/:id` | Change `title`, `due` or `done` |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/weather?city=Berlin` | Current weather, today's high/low, next 8 hours (cached 10 min) |
| GET | `/api/news` | A random story from today's Wikipedia "In the news" (cached 30 min) |
| GET | `/api/fact` | A random fun fact |

If an outside source can't be reached, its endpoint answers `502` with a readable `error` message and the page shows that message in place of the content.

## Database

Tasks live behind the `TaskRepository` interface in `server/src/lib/taskRepository.ts`. Adding a database means writing one class that implements it. Weather, news and facts don't need storage.
