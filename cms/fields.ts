import { isEmptyRich } from "../app/_lib/blog";

/**
 * Obligatoire pour l'éditeur, sans contrainte NOT NULL en base : un champ riche vidé
 * garde une structure vide, et ajouter une colonne obligatoire à une table qui contient
 * déjà des lignes obliguerait à reconstruire la table (migration fragile).
 */
export const requireText = (value: unknown) => (isEmptyRich(value) ? "Ce texte est obligatoire." : true);

/**
 * Ancien champ texte, conservé uniquement pour la conversion automatique vers l'éditeur
 * riche (cms/seed.ts). Caché, jamais saisi.
 *
 * Sa définition en base ne change pas (NOT NULL d'origine) : la modifier obligerait à
 * reconstruire la table. Comme il n'est plus saisi, on enregistre une chaîne vide plutôt
 * que NULL, et la validation est neutralisée.
 */
export const legacyText = {
  type: "textarea" as const,
  required: true,
  validate: () => true as const,
  hooks: { beforeChange: [({ value }: { value?: unknown }) => (typeof value === "string" ? value : "")] },
  admin: { hidden: true },
};
