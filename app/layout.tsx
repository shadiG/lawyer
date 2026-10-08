import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { site } from "./_lib/content";
import { Providers } from "./_components/providers";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const description =
  "Avocate à Paris en droit de la famille, du travail, pénal et immobilier. Conseil clair, accompagnement rigoureux. Demandez un rendez-vous en ligne.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.lawyer} · ${site.title}`,
    template: `%s · ${site.name}`,
  },
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

export const viewport: Viewport = {
  themeColor: "#f5f0e6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geist.variable} ${instrumentSerif.variable}`}>
      <body>
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
