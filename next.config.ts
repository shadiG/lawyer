import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sortie autonome : l'image Docker n'embarque que le strict nécessaire.
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  // Désactivé : le pré-rendu de la « coquille » des routes liées faisait exécuter
  // l'admin Payload (new Date()) à froid et remplissait la console d'alertes. Sans
  // effet utile ici : le site n'a qu'une page d'accueil et deux pages légales.
  partialPrefetching: false,
  experimental: {
    // 404 générale personnalisée (app/global-not-found.tsx) : l'app a deux layouts racines.
    globalNotFound: true,
  },
  images: {
    // Les photos de la médiathèque sont servies par Payload.
    localPatterns: [{ pathname: "/api/media/file/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
