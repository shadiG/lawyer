import type { MetadataRoute } from "next";
import { site } from "./_lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/healthz"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
