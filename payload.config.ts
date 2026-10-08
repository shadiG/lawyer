import path from "path";
import { fileURLToPath } from "url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Bookings } from "./cms/collections/bookings";
import { Media } from "./cms/collections/media";
import { Posts } from "./cms/collections/posts";
import { Practices } from "./cms/collections/practices";
import { Users } from "./cms/collections/users";
import { Home } from "./cms/globals/home";
import { Settings } from "./cms/globals/settings";
import { seed } from "./cms/seed";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// NEXT_PUBLIC_* est figée au build. ADMIN_ALLOWED_ORIGINS (lue à l'exécution,
// séparée par des virgules) permet d'ajouter d'autres adresses d'accès à l'admin
// (ex. https://www.exemple.fr) sans reconstruire l'image.
const origins = [siteUrl, ...(process.env.ADMIN_ALLOWED_ORIGINS ?? "").split(",")]
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    dateFormat: "dd/MM/yyyy HH:mm",
    // Habillage WordPress = thème clair uniquement (sinon l'OS en mode sombre
    // bascule Payload en sombre et mélange les deux palettes).
    theme: "light",
    // Des extensions de navigateur (Grammarly…) modifient <html>/<body> avant React.
    suppressHydrationWarning: true,
    meta: { titleSuffix: " · Administration du cabinet" },
    // Habillage « WordPress » : barre noire, menu latéral, tableau de bord.
    components: {
      header: ["/cms/components/AdminBar#AdminBar"],
      beforeNavLinks: ["/cms/components/NavTop#NavTop", "/cms/components/KeepNavOpen#KeepNavOpen"],
      graphics: {
        Logo: "/cms/components/Logo#Logo",
        Icon: "/cms/components/Icon#Icon",
      },
      views: { dashboard: { Component: "/cms/components/Dashboard#Dashboard" } },
    },
  },
  i18n: {
    supportedLanguages: { fr },
    fallbackLanguage: "fr",
    // Libellés plus naturels que « Créer un(e) nouveau ou nouvelle ».
    translations: {
      fr: {
        general: {
          createNew: "Ajouter",
          addNew: "Ajouter",
          save: "Enregistrer",
          saveChanges: "Enregistrer les modifications",
          perPage: "Par page : {{limit}}",
          creatingNewLabel: "Création : {{label}}",
          createNewLabel: "Ajouter : {{label}}",
        },
        fields: {
          chooseFromExisting: "Choisir dans la médiathèque",
        },
      },
    },
  },
  collections: [Bookings, Posts, Practices, Media, Users],
  globals: [Settings, Home],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET ?? "",
  // Les cookies de session ne sont acceptés que depuis nos propres domaines.
  csrf: origins,
  cors: origins,
  // L'admin n'utilise que l'API REST : on réduit la surface exposée.
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI ?? "file:./data/payload.db" },
    // En production le schéma évolue par migrations versionnées, jamais par « push ».
    prodMigrations: migrations,
  }),
  sharp,
  onInit: seed,
});
