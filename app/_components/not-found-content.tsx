import { Button } from "./button";

/** Contenu des pages 404 (introuvable) : sobre, avec deux issues claires. */
export function NotFoundContent() {
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center md:px-8">
      <p className="display text-[clamp(5rem,16vw,9rem)] leading-none text-brass">404</p>
      <span className="mt-6 block h-[3px] w-12 bg-brass" />
      <h1 className="display mt-6 text-[clamp(1.8rem,4vw,2.6rem)]">Page introuvable</h1>
      <p className="prose-fr mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
        L’adresse saisie n’existe pas ou n’est plus disponible. Elle a peut-être été déplacée.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">Retour à l’accueil</Button>
        <Button href="/actualites" variant="outline" icon={false}>
          Voir les actualités
        </Button>
      </div>
    </section>
  );
}
