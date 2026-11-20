import type { FastifyPluginAsync } from "fastify";
import type { Backdrop } from "../../../shared/types.js";
import { TtlCache, UpstreamError, getJson } from "../lib/cache.js";
import { stripHtml } from "./news.js";

// Freely licensed images from a Wikimedia Commons category, with credit + license.
// https://www.mediawiki.org/wiki/API:Imageinfo
const COMMONS = "https://commons.wikimedia.org/w/api.php";

interface CommonsResponse {
  query?: {
    pages?: Record<
      string,
      {
        title: string;
        imageinfo?: {
          thumburl?: string;
          url: string;
          descriptionurl: string;
          mime: string;
          extmetadata?: Record<string, { value: string } | undefined>;
        }[];
      }
    >;
  };
}

const OK_MIME = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export function parseCommons(data: CommonsResponse): Backdrop[] {
  return Object.values(data.query?.pages ?? {})
    .flatMap((p) => {
      const info = p.imageinfo?.[0];
      if (!info || !OK_MIME.has(info.mime)) return [];
      const meta = info.extmetadata ?? {};
      const animated = info.mime === "image/gif";
      return [
        {
          // GIF thumbnails can lose animation; use the original for those.
          url: animated ? info.url : (info.thumburl ?? info.url),
          pageUrl: info.descriptionurl,
          credit: stripHtml(meta.Artist?.value ?? "") || "Unknown photographer",
          license: meta.LicenseShortName?.value ?? null,
          animated,
        },
      ];
    })
    .sort((a, b) => a.url.localeCompare(b.url));
}

/** Extra image/GIF URLs from the BACKGROUND_URLS env var (comma separated). */
export function parseExtraUrls(value: string | undefined): Backdrop[] {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^https:\/\//.test(s))
    .map((url) => ({ url, pageUrl: null, credit: "Added by you", license: null, animated: /\.gif(\?|$)/i.test(url) }));
}

export const backgroundRoutes: FastifyPluginAsync<{ fetch: typeof fetch; category: string; extraUrls?: string }> = async (
  app,
  { fetch: fetcher, category, extraUrls },
) => {
  const cache = new TtlCache<Backdrop[]>(6 * 60 * 60 * 1000);
  const extras = parseExtraUrls(extraUrls);

  app.get("/", async (_req, reply) => {
    let commons = cache.get(category);
    if (!commons) {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "categorymembers",
        gcmtitle: `Category:${category}`,
        gcmtype: "file",
        gcmlimit: "50",
        prop: "imageinfo",
        iiprop: "url|mime|extmetadata",
        iiurlwidth: "1920",
        iiextmetadatafilter: "Artist|LicenseShortName",
      });
      try {
        commons = parseCommons(await getJson<CommonsResponse>(fetcher, `${COMMONS}?${params}`));
        cache.set(category, commons);
      } catch (err) {
        if (!(err instanceof UpstreamError)) throw err;
        if (extras.length === 0) return reply.code(502).send({ error: `Background photos are unavailable: ${err.message}.` });
        commons = [];
      }
    }
    return [...extras, ...commons];
  });
};
