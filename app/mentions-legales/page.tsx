import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";
import { site } from "../_lib/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

// ⚠️ Les valeurs entre crochets sont à remplacer par les informations réelles.
export default function Page() {
  return (
    <LegalPage title="Mentions légales" updated="[à compléter]">
      <section>
        <h2>Éditeur du site</h2>
        <p>
          {site.lawyer}, avocat inscrit au {site.barreau}.<br />
          Cabinet : {site.address.street}, {site.address.postalCode} {site.address.city}.<br />
          Téléphone : {site.phone} · E-mail : <a href={`mailto:${site.email}`}>{site.email}</a>
          <br />
          SIRET : [numéro SIRET] · Numéro de TVA intracommunautaire : [numéro, le cas échéant]
        </p>
      </section>
      <section>
        <h2>Profession réglementée</h2>
        <p>
          Titre professionnel : avocat, délivré en France. Barreau d’inscription : {site.barreau}. L’avocat est soumis
          au Règlement Intérieur National de la profession d’avocat (RIN) et au Règlement Intérieur du Barreau de Paris,
          consultables sur le site du Conseil national des barreaux (<a href="https://www.cnb.avocat.fr">cnb.avocat.fr</a>).
        </p>
      </section>
      <section>
        <h2>Assurance responsabilité civile professionnelle</h2>
        <p>
          [Nom de l’assureur], [adresse de l’assureur]. Garantie : [étendue territoriale]. Contrat n° [numéro].
        </p>
      </section>
      <section>
        <h2>Médiation</h2>
        <p>
          En cas de litige relatif aux honoraires, vous pouvez saisir le bâtonnier de l’Ordre des avocats du barreau
          d’inscription. [Compléter avec le médiateur de la consommation désigné, le cas échéant.]
        </p>
      </section>
      <section>
        <h2>Hébergeur</h2>
        <p>[Nom de l’hébergeur / du prestataire VPS], [adresse], [numéro de téléphone].</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>
          L’ensemble des contenus de ce site (textes, images, marques, éléments graphiques) est protégé. Toute
          reproduction sans autorisation écrite préalable est interdite.
        </p>
      </section>
    </LegalPage>
  );
}
