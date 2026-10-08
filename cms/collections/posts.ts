import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { slugify } from "../../app/_lib/blog";
import { publishChanges } from "../hooks/revalidate";

/**
 * Adresse de l'article : générée depuis le titre, conservée ensuite (changer le
 * titre ne casse pas les liens déjà partagés), et rendue unique (« -2 », « -3 »…).
 */
const makeSlug: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data) return data;
  const wanted = String(data.slug ?? originalDoc?.slug ?? "").trim();
  const base = slugify(wanted || String(data.title ?? originalDoc?.title ?? "")) || "article";

  let slug = base;
  for (let n = 2; n < 100; n++) {
    const { totalDocs } = await req.payload.count({
      collection: "posts",
      where: originalDoc?.id
        ? { and: [{ slug: { equals: slug } }, { id: { not_equals: originalDoc.id } }] }
        : { slug: { equals: slug } },
      req,
    });
    if (!totalDocs) break;
    slug = `${base}-${n}`;
  }
  return { ...data, slug };
};

/** À la première publication, la date de publication est « maintenant » (modifiable ensuite). */
const stampPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data._status === "published" && !data.publishedAt) return { ...data, publishedAt: new Date().toISOString() };
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Article", plural: "Articles" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedAt", "practice"],
    group: "Contenu",
    description: "Les articles du blog (« Actualités »). Un brouillon n'est pas visible sur le site tant que vous ne cliquez pas sur « Publier ».",
  },
  defaultSort: "-publishedAt",
  versions: { drafts: true, maxPerDoc: 10 },
  access: {
    // Le public ne voit que les articles publiés ; les connectés voient aussi les brouillons.
    read: ({ req }) => (req.user ? true : { _status: { equals: "published" } }),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [makeSlug],
    beforeChange: [stampPublishedAt],
    afterChange: [({ doc }) => (publishChanges(), doc)],
    afterDelete: [({ doc }) => (publishChanges(), doc)],
  },
  fields: [
    { name: "title", type: "text", label: "Titre", required: true, maxLength: 120 },
    {
      name: "excerpt",
      type: "textarea",
      label: "Résumé",
      required: true,
      maxLength: 220,
      admin: { description: "Une à deux phrases. Affiché dans la liste des articles et dans les résultats de recherche." },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Image à la une",
      admin: { description: "Facultatif. Format paysage conseillé (3:2)." },
    },
    {
      name: "content",
      type: "richText",
      label: "Contenu",
      required: true,
      editor: lexicalEditor({
        // Titre de page = <h1> : dans l'article on n'autorise que des intertitres h2/h3.
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter((f) => f.key !== "heading"),
          HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
          FixedToolbarFeature(),
        ],
      }),
    },
    {
      name: "slug",
      type: "text",
      label: "Adresse (slug)",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Générée depuis le titre ; elle apparaît dans le lien de l'article. Laissez vide pour la régénérer.",
      },
    },
    {
      name: "practice",
      type: "relationship",
      relationTo: "practices",
      label: "Domaine concerné",
      admin: { position: "sidebar", description: "Facultatif : affiché comme catégorie de l'article." },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Date de publication",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime", displayFormat: "dd/MM/yyyy HH:mm" },
        description: "Remplie à la première publication ; modifiable (par exemple pour antidater).",
      },
    },
  ],
};
