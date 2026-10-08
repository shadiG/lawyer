import type { Metadata } from "next";
import { Footer } from "../../_components/footer";
import { Nav } from "../../_components/nav";
import { PostGrid } from "../../_components/post-grid";
import { SectionHeading } from "../../_components/section-heading";
import { getContent } from "../../_lib/cms";
import { getPosts } from "../../_lib/posts";
import { connection } from "next/server";

/**
 * Page dépendante de la base (articles publiés à tout moment) : un article inconnu
 * ou en brouillon renvoie légitimement un 404. On l'exempte de la validation
 * « navigation instantanée » (dev uniquement), qui ne sait pas valider un 404.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les articles et actualités du cabinet.",
  alternates: { canonical: "/actualites", types: { "application/rss+xml": "/actualites/rss.xml" } },
};

export default async function Page() {
  // Rendu à chaque requête : jamais de contenu du CMS figé au build (voir docs/ops/vps.md).
  await connection();
  const [{ site }, posts] = await Promise.all([getContent(), getPosts()]);
  return (
    <>
      <Nav site={site} home={false} />
      <main id="contenu">
        <section className="bg-[linear-gradient(180deg,#eef1f6,#e4e9f1)]">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
            <SectionHeading title="Actualités" subtitle={`Les articles de ${site.lawyer}`} />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          {posts.length === 0 ? (
            <p className="prose-fr mx-auto max-w-lg text-center text-ink-soft">
              Aucun article n’est publié pour le moment. Revenez bientôt.
            </p>
          ) : (
            <PostGrid posts={posts} priorityCount={3} />
          )}
          <p className="mt-12 text-center text-sm text-ink-faint">
            <a href="/actualites/rss.xml" className="link-draw hover:text-ink">
              Suivre par flux RSS
            </a>
          </p>
        </section>
      </main>
      <Footer site={site} />
    </>
  );
}
