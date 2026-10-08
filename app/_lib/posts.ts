import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { CMS_TAG } from "@/cms/hooks/revalidate";
import type { Media, Post as PostDoc, Practice } from "@/payload-types";
import { lexicalToText, readingMinutes } from "./blog";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** ISO. */
  publishedAt: string;
  updatedAt: string;
  minutes: number;
  coverUrl: string | null;
  coverFullUrl: string | null;
  coverAlt: string | null;
  practice: string | null;
};

export type Post = PostSummary & { content: PostDoc["content"] };

const media = (m: PostDoc["cover"]): Media | null => (m && typeof m === "object" ? m : null);

function toPost(doc: PostDoc): Post | null {
  if (!doc.slug || !doc.title) return null;
  const cover = media(doc.cover);
  const practice = doc.practice && typeof doc.practice === "object" ? (doc.practice as Practice).title : null;
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? "",
    publishedAt: doc.publishedAt ?? doc.createdAt,
    updatedAt: doc.updatedAt,
    minutes: readingMinutes(lexicalToText(doc.content)),
    coverUrl: cover?.sizes?.card?.url ?? cover?.url ?? null,
    coverFullUrl: cover?.url ?? null,
    coverAlt: cover?.alt ?? null,
    practice,
    content: doc.content,
  };
}

const PUBLISHED = { _status: { equals: "published" } } as const;

/** Articles publiés, du plus récent au plus ancien (sans le contenu complet). */
export async function getPosts(limit = 60): Promise<PostSummary[]> {
  "use cache";
  cacheTag(CMS_TAG);
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: PUBLISHED,
      sort: "-publishedAt",
      limit,
      depth: 1,
      draft: false,
    });
    cacheLife("max");
    return docs.flatMap((d) => {
      const p = toPost(d);
      if (!p) return [];
      const { content: _content, ...summary } = p;
      void _content;
      return [summary];
    });
  } catch (err) {
    console.error("Blog indisponible :", err);
    cacheLife("seconds");
    return [];
  }
}

/** Un article publié par son adresse, contenu compris. `null` s'il n'existe pas (ou pas publié). */
export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag(CMS_TAG);
  try {
    const payload = await getPayload({ config });
    const { docs } = await payload.find({
      collection: "posts",
      where: { and: [PUBLISHED, { slug: { equals: slug } }] },
      limit: 1,
      depth: 2,
      draft: false,
    });
    cacheLife("max");
    return docs[0] ? toPost(docs[0]) : null;
  } catch (err) {
    console.error("Article indisponible :", err);
    cacheLife("seconds");
    return null;
  }
}
