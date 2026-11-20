# awesomework

A personal start page: your upcoming tasks, the weather outside, a story from today's news and a fun fact. The page background takes on the color of the actual sky (rain, clear, snow, night…).

## Stack

| Part | Tech |
| --- | --- |
| Frontend (`web/`) | React 19, TypeScript, Vite 6, plain CSS |
| Backend (`server/`) | Node, Fastify 5, TypeScript (run with `tsx`) |
| Shared types (`shared/`) | API response shapes, used by both sides |
| Data sources | [Open-Meteo](https://open-meteo.com) (weather), Wikipedia "In the news" feed, [uselessfacts](https://uselessfacts.jsph.pl): all free, no API keys |
| Background photos | Freely licensed images from a [Wikimedia Commons](https://commons.wikimedia.org) category (default: Joe Jonas), credited on the page |
| Tasks storage | Supabase Postgres (`public.tasks`), or in memory when Supabase isn't configured |

## Run it

Needs Node 20.6 or newer.

```bash
npm install
cp .env.example .env   # then fill in SUPABASE_URL and SUPABASE_SECRET_KEY
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
| GET | `/api/backgrounds` | Background photos with credit and license (cached 6 h) |

If an outside source can't be reached, its endpoint answers `502` with a readable `error` message and the page shows that message in place of the content.

## Background photos

The page shows three photos at a time, side by side (stacked on phones), from the Wikimedia Commons category in `BACKGROUND_CATEGORY` (default `Joe Jonas`), with the photographers and licenses under the page, as those licenses require. "Next photos" shows the next three. Animated GIFs are skipped for people who turn on reduced motion.

To add your own images or GIFs, set `BACKGROUND_URLS` to a comma-separated list of `https://` links. Only use images you have the right to use.

## Database (Supabase)

Tasks are stored in the `public.tasks` table of a Supabase Postgres database. The schema is in `supabase/migrations/`.

- Only the API server talks to Supabase, using a **secret key** (`SUPABASE_SECRET_KEY`, starts with `sb_secret_`). The browser never sees it.
- Row-level security is on with no policies, so the public (publishable) key can't read or change tasks. Supabase's advisor will list this as "RLS enabled, no policy"; that's intended.
- Without `SUPABASE_URL` and `SUPABASE_SECRET_KEY`, the server falls back to an in-memory list with sample tasks.

Storage goes through the `TaskRepository` interface (`server/src/lib/taskRepository.ts`), so another database only needs one new class.
