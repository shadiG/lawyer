import { getContent } from "../../../_lib/cms";
import { siteUrl } from "../../../_lib/content";
import { getPosts } from "../../../_lib/posts";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Flux RSS des articles publiés. */
export async function GET() {
  const [{ site }, posts] = await Promise.all([getContent(), getPosts(30)]);
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteUrl}/actualites/${esc(p.slug)}</link>
      <guid isPermaLink="true">${siteUrl}/actualites/${esc(p.slug)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(site.name)} · Actualités</title>
    <link>${siteUrl}/actualites</link>
    <description>${esc(`Les articles de ${site.lawyer}`)}</description>
    <language>fr-FR</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
