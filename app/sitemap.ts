import type { MetadataRoute } from "next";
import { siteUrl } from "./_lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/mentions-legales", "/confidentialite"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.3,
  }));
}
