import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "../_lib/posts";
import { ArrowRight, Scales } from "./icons";

const jour = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
export const formatDate = (iso: string) => jour.format(new Date(iso));

/** Carte d'article : visuel, domaine, titre, résumé. Toute la carte est cliquable. */
export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <article className="group relative flex h-full flex-col bg-white shadow-[0_2px_18px_-6px_rgb(18_22_29/0.18)] ring-1 ring-ink/[0.07] transition-[transform,box-shadow] duration-300 ease-[var(--ease-out)] hover:shadow-[0_22px_40px_-18px_rgb(11_73_179/0.35)] motion-safe:hover:-translate-y-1">
      <div className="relative aspect-[3/2] overflow-hidden bg-brass">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? ""}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b49b3,#082f78)]" />
            <Scales className="absolute -bottom-6 -right-4 text-[10rem] text-white/[0.12]" />
          </>
        )}
        {post.practice ? (
          <span className="absolute left-4 top-4 bg-white px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brass">
            {post.practice}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
        <p className="text-[0.78rem] text-ink-faint">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.minutes} min de lecture
        </p>
        <h3 className="display mt-3 text-[1.35rem]">
          {/* Le lien étendu couvre toute la carte (clavier et lecteur d'écran : un seul lien par carte) */}
          <Link href={`/actualites/${post.slug}`} prefetch={false} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="prose-fr mt-3 text-[0.93rem] leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-brass">
          Lire l’article
          <ArrowRight className="text-base transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
