import type { Metadata, Viewport } from "next";
import { richToText } from "../_lib/blog";
import { getContent } from "../_lib/cms";
import { geist, sourceSerif } from "../_lib/fonts";
import { siteUrl } from "../_lib/content";
import { Providers } from "../_components/providers";
import "../globals.css";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  // Rendu à chaque requête : jamais de contenu du CMS figé au build (voir docs/ops/vps.md).
  await connection();
  const { site, hero } = await getContent();
  const description = `${site.title}. ${richToText(hero.lead)}`.slice(0, 280);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${site.lawyer} · ${site.title}`, template: `%s · ${site.name}` },
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: site.name,
      title: `${site.lawyer} · ${site.title}`,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b49b3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning : des extensions de navigateur (Grammarly, etc.)
  // ajoutent des attributs sur <html> et <body> avant l'hydratation de React.
  return (
    <html lang="fr" className={`${geist.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Sans JavaScript, les révélations au scroll ne doivent rien cacher. */}
        <noscript>
          <style>{`[style*="opacity: 0"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <a
          href="#contenu"
          className="fixed left-4 top-4 z-50 -translate-y-24 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition-transform duration-200 focus:translate-y-0"
        >
          Aller au contenu
        </a>
        <Providers>{children}</Providers>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
