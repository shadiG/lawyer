import type { CollectionConfig } from "payload";
import { textEditor } from "../editors";
import { legacyText, requireText } from "../fields";
import { publishChanges } from "../hooks/revalidate";

export const Practices: CollectionConfig = {
  slug: "practices",
  labels: { singular: "Domaine d’intervention", plural: "Domaines d’intervention" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "order", "icon"],
    group: "Contenu",
    description: "Les cartes de la section « Domaines ». L’ordre croissant définit l’ordre d’affichage.",
  },
  defaultSort: "order",
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: { afterChange: [({ doc }) => (publishChanges(), doc)], afterDelete: [({ doc }) => (publishChanges(), doc)] },
  fields: [
    { name: "title", type: "text", label: "Titre", required: true, maxLength: 60 },
    {
      name: "icon",
      type: "select",
      label: "Icône",
      defaultValue: "criminal",
      required: true,
      options: [
        { label: "Famille", value: "family" },
        { label: "Travail", value: "work" },
        { label: "Balance (pénal)", value: "criminal" },
        { label: "Maison (immobilier)", value: "property" },
      ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Image de la carte",
      admin: { description: "Facultatif. Format paysage conseillé (3:2). Sans image, un fond bleu avec l’icône est affiché." },
    },
    { name: "body", type: "richText", editor: textEditor, label: "Présentation", validate: requireText },
    // Ancien champ texte : ne sert plus qu'à la conversion automatique (voir cms/seed.ts).
    { name: "text", label: "Présentation (ancienne saisie)", ...legacyText },
    {
      name: "items",
      type: "array",
      label: "Exemples de situations",
      maxRows: 5,
      labels: { singular: "Situation", plural: "Situations" },
      fields: [{ name: "text", type: "text", label: "Texte", required: true, maxLength: 70 }],
    },
    {
      name: "order",
      type: "number",
      label: "Ordre d’affichage",
      defaultValue: 10,
      admin: { position: "sidebar", step: 1 },
    },
  ],
};
