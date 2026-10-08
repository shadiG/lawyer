import type { Metadata } from "next";
import { NotFoundContent } from "./_components/not-found-content";
import { geist, sourceSerif } from "./_lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false },
};

/**
 * 404 pour les adresses qui ne correspondent à aucune route. L'app a deux layouts
 * racines (site et admin) : Next ne peut pas composer de 404 commune, il faut donc
 * ce document complet (voir `experimental.globalNotFound` dans next.config.ts).
 */
export default function GlobalNotFound() {
  return (
    // suppressHydrationWarning : des extensions de navigateur ajoutent des attributs avant React.
    <html lang="fr" className={`${geist.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main>
          <NotFoundContent />
        </main>
      </body>
    </html>
  );
}
