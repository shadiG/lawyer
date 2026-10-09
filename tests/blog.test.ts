import assert from "node:assert/strict";
import { test } from "node:test";
import { isSafeHref, lexicalToText, readingMinutes, simpleLexical, slugify } from "../app/_lib/blog";

test("slugify : accents, ligatures, apostrophes et ponctuation", () => {
  assert.equal(slugify("L’état d’urgence : œuvre de l’été !"), "l-etat-d-urgence-oeuvre-de-l-ete");
  assert.equal(slugify("  Divorce par consentement mutuel  "), "divorce-par-consentement-mutuel");
  assert.equal(slugify("Droit du travail — 5 conseils"), "droit-du-travail-5-conseils");
});

test("slugify : caractères dangereux et cas limites", () => {
  assert.equal(slugify("../../etc/passwd"), "etc-passwd");
  assert.equal(slugify("<script>alert(1)</script>"), "script-alert-1-script");
  assert.equal(slugify("???"), "");
  assert.equal(slugify("a".repeat(200)).length <= 80, true);
});

test("lexicalToText : extrait le texte des titres, paragraphes et enfants", () => {
  const s = simpleLexical([{ h2: "Titre" }, { p: "Premier paragraphe." }, { p: "Second." }]);
  assert.equal(lexicalToText(s), "Titre Premier paragraphe. Second.");
});

test("lexicalToText : tolère les entrées vides ou invalides", () => {
  assert.equal(lexicalToText(null), "");
  assert.equal(lexicalToText(undefined), "");
  assert.equal(lexicalToText({}), "");
  assert.equal(lexicalToText("pas un état"), "");
});

test("readingMinutes : minimum 1, ~200 mots par minute", () => {
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes("un deux trois"), 1);
  assert.equal(readingMinutes(Array(200).fill("mot").join(" ")), 1);
  assert.equal(readingMinutes(Array(201).fill("mot").join(" ")), 2);
  assert.equal(readingMinutes(Array(1000).fill("mot").join(" ")), 5);
});

test("isSafeHref : accepte les liens légitimes", () => {
  for (const u of ["https://example.org/page", "http://example.org", "HTTPS://EXAMPLE.ORG", "mailto:contact@exemple.fr", "tel:+33100000000", "/actualites/mon-article", "#cabinet", "  https://example.org  "]) {
    assert.equal(isSafeHref(u), true, u);
  }
});

test("isSafeHref : refuse javascript:, data:, vbscript: et leurs déguisements", () => {
  for (const u of ["javascript:alert(1)", "JavaScript:alert(1)", " javascript:alert(1)", "java\tscript:alert(1)", "java\nscript:alert(1)", "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)", "//evil.example/x", "ftp://example.org", "", "exemple.fr", null, undefined, 42]) {
    assert.equal(isSafeHref(u), false, String(u));
  }
});

import { isEmptyRich, pickRich, plainToLexical, richToText } from "../app/_lib/blog";

test("plainToLexical : paragraphes, sauts de ligne, texte vide", () => {
  const s = plainToLexical("Premier paragraphe.\n\nSecond,\navec un saut de ligne.");
  assert.equal(s.root.children.length, 2);
  assert.equal(lexicalToText(s), "Premier paragraphe. Second, avec un saut de ligne.");
  assert.equal(plainToLexical("").root.children.length, 0);
  assert.equal(plainToLexical("  \n\n  ").root.children.length, 0);
});

test("plainToLexical : le texte est conservé tel quel (pas d'interprétation HTML)", () => {
  assert.equal(lexicalToText(plainToLexical("<b>gras</b> & « guillemets »")), "<b>gras</b> & « guillemets »");
});

test("isEmptyRich : chaînes, états vides et entrées invalides", () => {
  assert.equal(isEmptyRich(""), true);
  assert.equal(isEmptyRich("   "), true);
  assert.equal(isEmptyRich("texte"), false);
  assert.equal(isEmptyRich(null), true);
  assert.equal(isEmptyRich(undefined), true);
  assert.equal(isEmptyRich({}), true);
  assert.equal(isEmptyRich(plainToLexical("")), true);
  assert.equal(isEmptyRich(plainToLexical("Bonjour")), false);
});

test("pickRich : prend le texte riche saisi, sinon le repli", () => {
  const saisi = plainToLexical("Saisi dans l'admin");
  assert.equal(pickRich(saisi, "Par défaut"), saisi);
  assert.equal(pickRich(plainToLexical(""), "Par défaut"), "Par défaut");
  assert.equal(pickRich(null, "Par défaut"), "Par défaut");
  assert.equal(pickRich("une chaîne ne compte pas comme saisie riche", "Par défaut"), "Par défaut");
});

test("richToText : chaîne ou état de l'éditeur", () => {
  assert.equal(richToText("  Un   texte \n simple "), "Un texte simple");
  assert.equal(richToText(plainToLexical("Un.\n\nDeux.")), "Un. Deux.");
});
