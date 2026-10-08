import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { publishChanges } from "../hooks/revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Média", plural: "Médiathèque" },
  admin: { group: "Contenu", description: "Photos et images du site." },
  access: {
    // Les images sont publiques (affichées sur le site) ; seul l'admin modifie.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    // Dossier persistant (volume Coolify) : voir DATA_DIR dans docs/ops/vps.md.
    staticDir: process.env.MEDIA_DIR ?? path.resolve(dirname, "../../data/media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    imageSizes: [{ name: "portrait", width: 960, height: 1296, position: "centre" }],
    adminThumbnail: "portrait",
  },
  hooks: { afterChange: [({ doc }) => (publishChanges(), doc)], afterDelete: [({ doc }) => (publishChanges(), doc)] },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Description de l’image",
      required: true,
      admin: { description: "Lue par les lecteurs d’écran. Ex. : « Portrait de Maître Marchand »." },
    },
  ],
};
