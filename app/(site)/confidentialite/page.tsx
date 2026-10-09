import type { Metadata } from "next";
import { LegalPage } from "../../_components/legal-page";
import { getContent } from "../../_lib/cms";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  alternates: { canonical: "/confidentialite" },
};

// ⚠️ Texte à faire valider par l'avocat : il décrit l'architecture actuelle du site.
export default async function Page() {
  // Rendu à chaque requête : jamais de contenu du CMS figé au build (voir docs/ops/vps.md).
  await connection();
  const { site, legal } = await getContent();
  return (
    <LegalPage site={site} title="Politique de confidentialité" updated={legal.updated}>
      <section>
        <h2>Responsable du traitement</h2>
        <p>
          {site.lawyer}, {site.address.street}, {site.address.postalCode} {site.address.city} ·{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>
      <section>
        <h2>Données collectées</h2>
        <p>Lorsque vous demandez un rendez-vous, nous collectons uniquement :</p>
        <ul>
          <li>votre nom et votre adresse e-mail ;</li>
          <li>votre numéro de téléphone, si vous le renseignez ;</li>
          <li>le sujet, le mode, le jour et le moment souhaités ;</li>
          <li>le message que vous choisissez d’écrire.</li>
        </ul>
        <p>
          Nous vous invitons à ne communiquer aucune information sensible dans ce formulaire : elles seront abordées
          lors du rendez-vous, sous le secret professionnel.
        </p>
      </section>
      <section>
        <h2>Finalité et base légale</h2>
        <p>
          Ces données servent exclusivement à répondre à votre demande et à organiser un rendez-vous. Base légale :
          votre consentement (article 6.1.a du RGPD) et les mesures précontractuelles prises à votre demande.
        </p>
      </section>
      <section>
        <h2>Durée de conservation</h2>
        <p>
          Si aucun dossier n’est ouvert, vos données sont supprimées au plus tard {legal.retention} après le dernier
          échange. Si un dossier est ouvert, elles sont conservées selon les obligations professionnelles de l’avocat.
        </p>
      </section>
      <section>
        <h2>Destinataires et hébergement</h2>
        <p>
          Votre demande est enregistrée sur le serveur du cabinet et notifiée par e-mail via un prestataire d’envoi
          (Resend) agissant comme sous-traitant. Seul le cabinet y accède. Aucune donnée n’est vendue ni utilisée à
          des fins publicitaires.
        </p>
      </section>
      <section>
        <h2>Cookies et mesure d’audience</h2>
        <p>
          Le site public n’utilise aucun traceur publicitaire ni cookie nécessitant votre consentement. Un cookie
          technique de session est déposé uniquement pour les personnes qui se connectent à l’espace d’administration.
        </p>
      </section>
      <section>
        <h2>Vos droits</h2>
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de
          portabilité. Écrivez à <a href={`mailto:${site.email}`}>{site.email}</a>. Vous pouvez aussi saisir la CNIL
          (<a href="https://www.cnil.fr">cnil.fr</a>).
        </p>
      </section>
    </LegalPage>
  );
}
