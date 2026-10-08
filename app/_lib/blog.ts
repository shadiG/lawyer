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
    if (n.type === "linebreak") out.push(" "); // un saut de ligne sépare deux mots
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

/* ------------------------------------------------------------------ *
 * Textes riches du site (éditeur WYSIWYG des champs de contenu)
 * ------------------------------------------------------------------ */

/** Un texte du site : une chaîne simple (valeurs par défaut) ou un état de l'éditeur riche. */
export type Rich = string | { root: Record<string, unknown> };

const isEditorState = (v: unknown): v is { root: Record<string, unknown> } =>
  typeof v === "object" && v !== null && "root" in v && typeof (v as { root: unknown }).root === "object";

/** Un champ riche est « vide » s'il n'a aucun texte (un éditeur vidé garde une structure vide). */
export function isEmptyRich(v: unknown): boolean {
  if (typeof v === "string") return v.trim() === "";
  if (!isEditorState(v)) return true;
  return lexicalToText(v) === "";
}

/** Texte brut d'un texte riche (méta-descriptions, aperçus). */
export function richToText(v: Rich): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : lexicalToText(v);
}

/** Le texte riche saisi s'il existe, sinon la valeur de repli. */
export function pickRich(value: unknown, fallback: Rich): Rich {
  return isEditorState(value) && !isEmptyRich(value) ? value : fallback;
}

/**
 * Texte brut → contenu de l'éditeur. Lignes vides = nouveaux paragraphes ;
 * un simple retour à la ligne devient un saut de ligne dans le paragraphe.
 */
export function plainToLexical(text: string) {
  const textNode = (t: string) => ({ type: "text", text: t, version: 1, detail: 0, format: 0, mode: "normal", style: "" });
  const base = { version: 1, format: "", indent: 0, direction: "ltr" as const };
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    root: {
      type: "root",
      ...base,
      children: paragraphs.map((p) => ({
        type: "paragraph",
        textFormat: 0,
        ...base,
        children: p.split("\n").flatMap((line, i) => (i === 0 ? [textNode(line)] : [{ type: "linebreak", version: 1 }, textNode(line)])),
      })),
    },
  };
}
