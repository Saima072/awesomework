import type { FastifyPluginAsync } from "fastify";
import type { NewsItem } from "../../../shared/types.js";
import { TtlCache, UpstreamError, getJson } from "../lib/cache.js";

// Wikipedia's daily featured feed includes the "In the news" section. Free, no key.
// https://api.wikimedia.org/wiki/Feed_API/Reference/Featured_content
const FEED = "https://api.wikimedia.org/feed/v1/wikipedia/en/featured";

interface FeedResponse {
  news?: { story: string; links?: { content_urls?: { desktop?: { page?: string } } }[] }[];
}

/** The feed's stories are HTML snippets; keep the text only. */
export function stripHtml(html: string): string {
  return html
    .replace(/<!--.*?-->/gs, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const newsRoutes: FastifyPluginAsync<{ fetch: typeof fetch }> = async (app, { fetch: fetcher }) => {
  const cache = new TtlCache<NewsItem[]>(30 * 60 * 1000);

  app.get("/", async (_req, reply) => {
    try {
      let items = cache.get("today");
      if (!items) {
        const d = new Date();
        const path = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`;
        const feed = await getJson<FeedResponse>(fetcher, `${FEED}/${path}`);
        items = (feed.news ?? []).map((n) => ({
          headline: stripHtml(n.story),
          url: n.links?.[0]?.content_urls?.desktop?.page ?? null,
          source: "Wikipedia · In the news",
        }));
        cache.set("today", items);
      }
      if (items.length === 0) return reply.code(404).send({ error: "There are no news stories today." });
      return items[Math.floor(Math.random() * items.length)];
    } catch (err) {
      if (err instanceof UpstreamError) return reply.code(502).send({ error: `News is unavailable: ${err.message}.` });
      throw err;
    }
  });
};
