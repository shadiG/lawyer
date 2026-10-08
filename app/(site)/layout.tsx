import type { Metadata, Viewport } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { getContent } from "../_lib/cms";
import { siteUrl } from "../_lib/content";
import { Providers } from "../_components/providers";
import "../globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { site, hero } = await getContent();
  const description = `${site.title}. ${hero.lead}`.slice(0, 280);
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
