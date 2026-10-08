import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import config from "@payload-config";
import { getPayload } from "payload";
import { Button } from "../../../_components/button";
import { Footer } from "../../../_components/footer";
import { Nav } from "../../../_components/nav";
import { PostGrid } from "../../../_components/post-grid";
import { formatDate } from "../../../_components/post-card";
import { Prose } from "../../../_components/rich-text";
import { SectionHeading } from "../../../_components/section-heading";
import { getContent } from "../../../_lib/cms";
import { siteUrl } from "../../../_lib/content";
import { getPost, getPosts } from "../../../_lib/posts";

/**
 * Page dépendante de la base (articles publiés à tout moment) : un article inconnu
 * ou en brouillon renvoie légitimement un 404. On l'exempte de la validation
 * « navigation instantanée » (dev uniquement), qui ne sait pas valider un 404.
 */
export const instant = false;

type Props = { params: Promise<{ slug: string }> };

/**
 * Cache Components exige au moins une valeur : les articles publiés au moment du
 * build (au minimum l'article d'exemple de l'amorçage). Les articles publiés
 * ensuite sont rendus à la première visite, puis mis en cache.
 */
export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    limit: 100,
    depth: 0,
    draft: false,
    select: { slug: true },
  });
  const slugs = docs.map((d) => d.slug).filter((s): s is string => Boolean(s));
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "exemple" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article introuvable", robots: { index: false } };
  const image = post.coverFullUrl ?? undefined;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/actualites/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [post, { site }, all] = await Promise.all([getPost(slug), getContent(), getPosts()]);
  if (!post) notFound();

  const others = all.filter((p) => p.id !== post.id).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: `${siteUrl}/actualites/${post.slug}`,
    image: post.coverFullUrl ? [post.coverFullUrl.startsWith("http") ? post.coverFullUrl : `${siteUrl}${post.coverFullUrl}`] : undefined,
    author: { "@type": "Person", name: site.lawyer },
    publisher: { "@type": "Organization", name: site.name },
    inLanguage: "fr-FR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Échappement de « < » pour qu'aucune balise ne puisse clore le script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Nav site={site} home={false} />
      <main id="contenu">
        <header className="bg-[linear-gradient(180deg,#eef1f6,#e4e9f1)]">
          <div className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-20">
            <nav aria-label="Fil d’Ariane" className="text-sm text-ink-faint">
              <Link href="/" className="link-draw hover:text-ink">Accueil</Link>
              <span aria-hidden="true"> / </span>
              <Link href="/actualites" className="link-draw hover:text-ink">Actualités</Link>
            </nav>
            {post.practice ? (
              <p className="mt-6 inline-block bg-brass px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">
                {post.practice}
              </p>
            ) : null}
            <h1 className="display mt-4 text-[clamp(2rem,4.6vw,3.2rem)]">{post.title}</h1>
            <p className="prose-fr mt-5 text-lg leading-relaxed text-ink-soft">{post.excerpt}</p>
            <p className="mt-6 text-sm text-ink-faint">
              Par {site.lawyer} · <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.minutes} min de lecture
            </p>
          </div>
        </header>

        <article className="mx-auto max-w-3xl px-4 pb-16 pt-10 md:px-8">
          {post.coverFullUrl ? (
            <Image
              src={post.coverFullUrl}
              alt={post.coverAlt ?? ""}
              width={1200}
              height={800}
              priority
              sizes="(min-width: 768px) 768px, 100vw"
              className="mb-10 h-auto w-full"
            />
          ) : null}
          <Prose data={post.content} />

          <aside className="mt-14 bg-brass p-8 text-white md:p-10">
            <h2 className="display text-[1.5rem] text-white">Une question sur votre situation ?</h2>
            <p className="mt-3 max-w-lg text-white/80">
              Chaque dossier est particulier. Exposez-nous le vôtre : nous vous répondons sous {site.responseTime}.
            </p>
            <div className="mt-6">
              <Button href="/#rendez-vous" variant="white">Prendre rendez-vous</Button>
            </div>
          </aside>
        </article>

        {others.length > 0 ? (
          <section className="bg-paper-deep">
            <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
              <SectionHeading title="À lire aussi" />
              <div className="mt-12">
                <PostGrid posts={others} />
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer site={site} />
    </>
  );
}
