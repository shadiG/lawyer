import {
  BoldFeature,
  FixedToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from "@payloadcms/richtext-lexical";

/**
 * Éditeur WYSIWYG des champs de texte du site (introductions, présentation,
 * étapes, honoraires…) : volontairement sobre, pour que la mise en forme reste
 * cohérente avec le design (pas de titres ni d'images dans ces champs).
 * La barre d'outils s'affiche au-dessus du champ en cours de saisie.
 */
export const textEditor = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature({ enabledCollections: ["posts"] }),
    FixedToolbarFeature({ applyToFocusedEditor: true }),
  ],
});
