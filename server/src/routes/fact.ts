import type { FastifyPluginAsync } from "fastify";
import type { Fact } from "../../../shared/types.js";
import { UpstreamError, getJson } from "../lib/cache.js";

// Free, no key. https://uselessfacts.jsph.pl
const FACTS = "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en";

export const factRoutes: FastifyPluginAsync<{ fetch: typeof fetch }> = async (app, { fetch: fetcher }) => {
  app.get("/", async (_req, reply): Promise<Fact | void> => {
    try {
      const data = await getJson<{ text: string; source?: string }>(fetcher, FACTS);
      return { text: data.text.trim(), source: data.source ?? "uselessfacts.jsph.pl" };
    } catch (err) {
      if (err instanceof UpstreamError) return reply.code(502).send({ error: `Fun facts are unavailable: ${err.message}.` });
      throw err;
    }
  });
};
