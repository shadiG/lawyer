import type { GlobalConfig } from "payload";
import { publishChanges } from "../hooks/revalidate";

export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Cabinet",
  admin: { group: "Contenu", description: "Identité, coordonnées et informations légales du cabinet." },
  access: { read: () => true, update: ({ req }) => Boolean(req.user) },
  hooks: { afterChange: [({ doc }) => (publishChanges(), doc)] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identité",
          fields: [
            { name: "name", type: "text", label: "Nom du cabinet", required: true },
            { name: "lawyer", type: "text", label: "Nom de l’avocat", required: true, admin: { description: "Ex. : Maître Élise Marchand" } },
            { name: "monogram", type: "text", label: "Monogramme", maxLength: 3, admin: { description: "2 ou 3 lettres, affichées dans la barre et le portrait." } },
            { name: "title", type: "text", label: "Titre", admin: { description: "Ex. : Avocate à Paris" } },
            { name: "barreau", type: "text", label: "Barreau d’inscription" },
            {
              name: "portrait",
              type: "upload",
              relationTo: "media",
              label: "Photo de portrait",
              admin: { description: "Format portrait conseillé (4:5). Sans photo, un portrait illustré est affiché." },
            },
          ],
        },
        {
          label: "Coordonnées",
          fields: [
            {
              name: "address",
              type: "group",
              label: "Adresse",
              fields: [
                { name: "street", type: "text", label: "Rue" },
                { name: "postalCode", type: "text", label: "Code postal" },
                { name: "city", type: "text", label: "Ville" },
              ],
            },
            { name: "phone", type: "text", label: "Téléphone" },
            { name: "email", type: "email", label: "E-mail de contact (affiché sur le site)" },
            {
              name: "hours",
              type: "array",
              label: "Horaires",
              labels: { singular: "Plage", plural: "Plages" },
              fields: [
                { name: "days", type: "text", label: "Jours", required: true },
                { name: "time", type: "text", label: "Heures", required: true },
              ],
            },
            {
              name: "responseTime",
              type: "text",
              label: "Délai de réponse annoncé",
              admin: { description: "Ex. : un jour ouvré. Affiché dans la page : ne promettez que ce que vous tenez." },
            },
          ],
        },
        {
          label: "Mentions légales",
          description: "Alimente les pages « Mentions légales » et « Confidentialité ».",
          fields: [
            { name: "siret", type: "text", label: "SIRET" },
            { name: "vat", type: "text", label: "N° de TVA intracommunautaire" },
            { name: "insurer", type: "textarea", label: "Assurance responsabilité civile professionnelle" },
            { name: "hosting", type: "textarea", label: "Hébergeur" },
            { name: "mediator", type: "textarea", label: "Médiateur" },
            { name: "retention", type: "text", label: "Durée de conservation des demandes", admin: { description: "Ex. : 12 mois" } },
            { name: "updated", type: "text", label: "Date de dernière mise à jour des pages légales" },
          ],
        },
      ],
    },
  ],
};
