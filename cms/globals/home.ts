import type { GlobalConfig } from "payload";
import { textEditor } from "../editors";
import { legacyText, requireText } from "../fields";
import { publishChanges } from "../hooks/revalidate";

const legacy = { hidden: true } as const;  // champs facultatifs d'origine, cachés (conversion automatique)

export const Home: GlobalConfig = {
  slug: "home",
  label: "Page d’accueil",
  admin: { group: "Contenu", description: "Les textes de chaque section de la page d’accueil." },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [({ doc }) => (publishChanges(), doc)] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Bandeau d’accueil",
          fields: [
            {
              name: "hero",
              type: "group",
              label: "Bandeau",
              fields: [
                { name: "eyebrow", type: "text", label: "Étiquette", maxLength: 60 },
                { name: "title", type: "text", label: "Titre principal", required: true, maxLength: 90 },
                { name: "leadRich", type: "richText", editor: textEditor, label: "Introduction" },
                { name: "lead", type: "textarea", label: "Introduction (ancienne saisie)", admin: legacy },
                {
                  name: "highlights",
                  type: "array",
                  label: "Atouts (bandeau bleu sous le bandeau d’accueil)",
                  maxRows: 3,
                  labels: { singular: "Atout", plural: "Atouts" },
                  fields: [
                    { name: "title", type: "text", label: "Titre", required: true, maxLength: 40 },
                    { name: "text", type: "textarea", label: "Texte", required: true, maxLength: 110 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Le cabinet",
          fields: [
            {
              name: "about",
              type: "group",
              label: "Présentation",
              fields: [
                { name: "title", type: "text", label: "Titre", maxLength: 90 },
                {
                  name: "body",
                  type: "richText",
                  editor: textEditor,
                  label: "Présentation",
                  admin: { description: "Plusieurs paragraphes possibles ; gras, italique, listes et liens disponibles dans la barre d’outils." },
                },
                {
                  name: "paragraphs",
                  type: "array",
                  label: "Paragraphes (anciens)",
                  admin: legacy,
                  fields: [{ name: "text", label: "Texte", ...legacyText }],
                },
                { name: "quote", type: "text", label: "Citation", maxLength: 140 },
                {
                  name: "facts",
                  type: "array",
                  label: "Repères",
                  maxRows: 6,
                  labels: { singular: "Repère", plural: "Repères" },
                  fields: [
                    { name: "label", type: "text", label: "Intitulé", required: true },
                    { name: "value", type: "text", label: "Valeur", required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Déroulé",
          fields: [
            {
              name: "steps",
              type: "array",
              label: "Étapes",
              minRows: 1,
              maxRows: 5,
              labels: { singular: "Étape", plural: "Étapes" },
              admin: { description: "Numérotées automatiquement dans l’ordre." },
              fields: [
                { name: "title", type: "text", label: "Titre", required: true, maxLength: 60 },
                { name: "body", type: "richText", editor: textEditor, label: "Texte", validate: requireText },
                { name: "text", label: "Texte (ancienne saisie)", ...legacyText },
              ],
            },
          ],
        },
        {
          label: "Honoraires",
          fields: [
            {
              name: "fees",
              type: "group",
              label: "Honoraires",
              fields: [
                { name: "title", type: "text", label: "Titre", maxLength: 90 },
                { name: "leadRich", type: "richText", editor: textEditor, label: "Introduction" },
                { name: "lead", type: "textarea", label: "Introduction (ancienne saisie)", admin: legacy },
                {
                  name: "items",
                  type: "array",
                  label: "Points",
                  maxRows: 5,
                  labels: { singular: "Point", plural: "Points" },
                  fields: [
                    { name: "title", type: "text", label: "Titre", required: true, maxLength: 60 },
                    { name: "body", type: "richText", editor: textEditor, label: "Texte", validate: requireText },
                    { name: "text", label: "Texte (ancienne saisie)", ...legacyText },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Rendez-vous",
          fields: [
            {
              name: "booking",
              type: "group",
              label: "Prise de rendez-vous",
              fields: [
                { name: "title", type: "text", label: "Titre", maxLength: 60 },
                { name: "lead", type: "textarea", label: "Introduction", maxLength: 240 },
              ],
            },
          ],
        },
      ],
    },
  ],
};
