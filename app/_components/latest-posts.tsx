import type { PostSummary } from "../_lib/posts";
import { Button } from "./button";
import { PostGrid } from "./post-grid";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/** Les derniers articles, sur l'accueil. Rien n'est affiché tant qu'aucun article n'est publié. */
export function LatestPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;
  return (
    <section id="actualites" className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading title="Actualités" subtitle="Nos derniers articles" />
        <div className="mt-14">
          <PostGrid posts={posts} />
        </div>
        <Reveal className="mt-12 text-center">
          <Button href="/actualites">Toutes les actualités</Button>
        </Reveal>
      </div>
    </section>
  );
}
