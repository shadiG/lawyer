import Link from "next/link";
import type { SiteContent } from "../_lib/content";

export function LegalPage({
  site,
  title,
  updated,
  children,
}: {
  site: SiteContent["site"];
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-8 md:px-8">
        <Link href="/" className="press display text-2xl" aria-label={`${site.name}, accueil`}>
          {site.monogram}
        </Link>
        <Link href="/" className="link-draw text-sm text-ink-soft hover:text-ink">
          Retour au site
        </Link>
      </header>
      <main id="contenu" className="mx-auto max-w-3xl px-4 pb-32 pt-16 md:px-8 md:pt-24">
        <h1 className="display text-[clamp(2.5rem,6vw,4.5rem)]">{title}</h1>
        <p className="mt-4 text-sm text-ink-faint">Dernière mise à jour : {updated}</p>
        <div className="mt-12 space-y-10 leading-relaxed text-ink-soft [&_h2]:display [&_h2]:mb-3 [&_h2]:text-[1.75rem] [&_h2]:text-ink [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc">
          {children}
        </div>
      </main>
    </>
  );
}
