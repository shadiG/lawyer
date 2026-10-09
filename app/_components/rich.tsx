import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Rich } from "../_lib/blog";
import { converters } from "./rich-text";

/**
 * Un texte du site : chaîne simple (valeurs par défaut, lignes vides = paragraphes)
 * ou contenu de l'éditeur WYSIWYG de l'administration. La taille, la couleur et la
 * police viennent du parent ; `.rich` (globals.css) ne règle que l'espacement des
 * paragraphes et des listes. Fonctionne côté serveur comme côté client.
 */
export function RichBlock({ value, className = "" }: { value: Rich; className?: string }) {
  if (typeof value === "string") {
    const paragraphs = value
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    return (
      <div className={`rich ${className}`}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }
  return (
    <div className={`rich ${className}`}>
      <RichText data={value as Parameters<typeof RichText>[0]["data"]} converters={converters} />
    </div>
  );
}
