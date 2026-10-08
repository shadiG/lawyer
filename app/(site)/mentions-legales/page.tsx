import type { Metadata } from "next";
import { LegalPage } from "../../_components/legal-page";
import { getContent } from "../../_lib/cms";

export const metadata: Metadata = {
  title: "Mentions légales",
  alternates: { canonical: "/mentions-legales" },
};

// Les informations viennent de l'administration (Cabinet › Mentions légales).
export default async function Page() {
  const { site, legal } = await getContent();
  return (
    <LegalPage site={site} title="Mentions légales" updated={legal.updated}>
      <section>
        <h2>Éditeur du site</h2>
        <p>
          {site.lawyer}, avocat inscrit au {site.barreau}.<br />
          Cabinet : {site.address.street}, {site.address.postalCode} {site.address.city}.<br />
          Téléphone : {site.phone} · E-mail : <a href={`mailto:${site.email}`}>{site.email}</a>
          <br />
          SIRET : {legal.siret} · Numéro de TVA intracommunautaire : {legal.vat}
        </p>
      </section>
      <section>
        <h2>Profession réglementée</h2>
        <p>
          Titre professionnel : avocat, délivré en France. Barreau d’inscription : {site.barreau}. L’avocat est soumis
          au Règlement Intérieur National de la profession d’avocat (RIN) et au règlement intérieur de son barreau,
          consultables sur le site du Conseil national des barreaux (<a href="https://www.cnb.avocat.fr">cnb.avocat.fr</a>).
        </p>
      </section>
      <section>
        <h2>Assurance responsabilité civile professionnelle</h2>
        <p>{legal.insurer}</p>
      </section>
      <section>
        <h2>Médiation</h2>
        <p>
          En cas de litige relatif aux honoraires, vous pouvez saisir le bâtonnier de l’Ordre des avocats du barreau
          d’inscription. {legal.mediator}
        </p>
      </section>
      <section>
        <h2>Hébergeur</h2>
        <p>{legal.hosting}</p>
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
