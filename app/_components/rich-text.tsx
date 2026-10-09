import { defaultJSXConverters, LinkJSXConverter, RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { isSafeHref } from "../_lib/blog";

type Data = Parameters<typeof RichText>[0]["data"];

/** Les images insérées dans l'éditeur : optimisées par Next, jamais plus larges que la colonne. */
export const converters: JSXConvertersFunction = ({ defaultConverters }) => {
  // Liens internes (vers un autre article, un domaine) : résolus ici ; liens libres : contrôlés ci-dessous.
  const internal = LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc as { relationTo?: string; value?: { slug?: string } | number | string } | undefined;
      if (doc?.relationTo === "posts" && typeof doc.value === "object" && doc.value?.slug) return `/actualites/${doc.value.slug}`;
      return "/";
    },
  });
  const safeLink = (args: Parameters<Extract<typeof internal.link, (...a: never[]) => unknown>>[0]) => {
    const { node, nodesToJSX } = args;
    if (node.fields.linkType === "custom") {
      const url = node.fields.url;
      const children = nodesToJSX({ nodes: node.children });
      if (!isSafeHref(url)) return <>{children}</>; // lien dangereux : on garde le texte, sans lien
      const external = /^https?:\/\//i.test(url.trim());
      return (
        <a href={url.trim()} {...(node.fields.newTab || external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    }
    const fallback = internal.link; // convertisseur de Payload pour les liens internes
    return typeof fallback === "function" ? fallback(args) : (fallback ?? null);
  };
  return {
    ...defaultConverters,
    ...internal,
    link: safeLink,
    // Les liens détectés automatiquement (URL collée) suivent la même règle de sécurité.
    autolink: (args) => safeLink(args as never),
    upload: ({ node }) => {
      const m = node.value as
        | { url?: string | null; alt?: string | null; width?: number | null; height?: number | null; mimeType?: string | null }
        | number
        | string;
      if (!m || typeof m !== "object" || !m.url || !m.mimeType?.startsWith("image/")) return null;
      return (
        <figure className="article-figure">
          <Image
            src={m.url}
            alt={m.alt ?? ""}
            width={m.width ?? 1200}
            height={m.height ?? 800}
            sizes="(min-width: 768px) 720px, 100vw"
            className="h-auto w-full"
          />
        </figure>
      );
    },
  };
};

/**
 * Contenu de l'éditeur WYSIWYG, mis en page par `.article-body` (globals.css).
 * Le HTML vient de l'éditeur de l'administration ; React échappe tout le texte.
 */
export function Prose({ data }: { data: Data }) {
  return (
    <div className="article-body">
      <RichText data={data} converters={converters} />
    </div>
  );
}

// Réexport utile pour d'éventuels convertisseurs personnalisés plus tard.
export { defaultJSXConverters };
