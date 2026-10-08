import type { MetadataRoute } from "next";
import { siteUrl } from "./_lib/content";
import { getPosts } from "./_lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(200);
  const fixes = ["", "/actualites", "/mentions-legales", "/confidentialite"].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "/actualites" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/actualites" ? 0.7 : 0.3,
  }));
  return [
    ...fixes,
    ...posts.map((p) => ({
      url: `${siteUrl}/actualites/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
