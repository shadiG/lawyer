import type { PostSummary } from "../_lib/posts";
import { PostCard } from "./post-card";
import { Reveal } from "./reveal";

/**
 * Grille d'articles : 1, 2 ou 3 colonnes selon la largeur, et les cartes restent
 * centrées quand il y en a peu (un seul article ne se colle pas à gauche).
 */
export function PostGrid({ posts, priorityCount = 0 }: { posts: PostSummary[]; priorityCount?: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {posts.map((p, i) => (
        <Reveal key={p.id} delay={(i % 3) * 0.08} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
          <PostCard post={p} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}
