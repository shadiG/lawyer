/**
 * Fonctions pures du blog (aucune dépendance à Next ni à Payload) :
 * testables telles quelles (`npm test`).
 */

/** « L’état d’urgence : œuvre ! » → « l-etat-d-urgence-oeuvre » */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

type Node = { type?: string; text?: string; children?: Node[] };

/** Texte brut d'un contenu de l'éditeur (état Lexical sérialisé), blocs séparés par une espace. */
export function lexicalToText(state: unknown): string {
  const root = (state as { root?: Node } | null | undefined)?.root;
  if (!root) return "";
  const out: string[] = [];
  const walk = (n: Node) => {
    if (typeof n.text === "string") out.push(n.text);
    if (n.children) {
      for (const c of n.children) walk(c);
      out.push(" ");
    }
  };
  walk(root);
  return out.join("").replace(/\s+/g, " ").trim();
}

/** Durée de lecture en minutes (≈ 200 mots/min), au moins 1. */
export function readingMinutes(text: string): number {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

type Block = { h2: string } | { p: string };

/** Contenu minimal au format de l'éditeur, pour amorcer un article d'exemple. */
export function simpleLexical(blocks: Block[]) {
  const text = (t: string) => ({ type: "text", text: t, version: 1, detail: 0, format: 0, mode: "normal", style: "" });
  const base = { version: 1, format: "", indent: 0, direction: "ltr" as const };
  return {
    root: {
      type: "root",
      ...base,
      children: blocks.map((b) =>
        "h2" in b
          ? { type: "heading", tag: "h2", ...base, children: [text(b.h2)] }
          : { type: "paragraph", textFormat: 0, ...base, children: [text(b.p)] },
      ),
    },
  };
}

/**
 * Un lien saisi dans l'éditeur n'est rendu que s'il pointe vers http(s), mailto, tel,
 * une page du site (« /… », pas « //hôte ») ou une ancre. Jamais `javascript:` ni `data:`,
 * même déguisés (majuscules, espaces, retours à la ligne, tabulations).
 */
export function isSafeHref(url: unknown): url is string {
  if (typeof url !== "string") return false;
  // Les navigateurs ignorent tabulations et retours à la ligne dans le schéma : on les retire avant de juger.
  const u = url.replace(/[\u0000-\u0020]+/g, "");
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(u);
}
