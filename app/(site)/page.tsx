import { About } from "../_components/about";
import { Booking } from "../_components/booking";
import { Fees } from "../_components/fees";
import { Footer } from "../_components/footer";
import { Hero } from "../_components/hero";
import { Nav } from "../_components/nav";
import { Practices } from "../_components/practices";
import { Process } from "../_components/process";
import { getContent } from "../_lib/cms";
import { siteUrl, type SiteContent } from "../_lib/content";


function buildJsonLd(site: SiteContent["site"]) {
  return {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: site.name,
  description: `${site.lawyer}, ${site.title}`,
  url: siteUrl,
  telephone: site.phoneHref,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.postalCode,
    addressLocality: site.address.city,
    addressCountry: "FR",
  },
  areaServed: "FR",
  founder: { "@type": "Person", name: site.lawyer, jobTitle: "Avocat" },
  };
}

export default async function Home() {
  const c = await getContent();
  const jsonLd = buildJsonLd(c.site);
  return (
    <>
      <script
        type="application/ld+json"
        // Échappement de « < » pour qu’aucune balise ne puisse clore le script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Nav site={c.site} />
      <main id="contenu">
        <Hero hero={c.hero} site={c.site} />
        <About about={c.about} />
        <Practices practices={c.practices} />
        <Process steps={c.steps} />
        <Fees fees={c.fees} />
        <Booking booking={c.booking} site={c.site} availability={c.availability} />
      </main>
      <Footer site={c.site} />
    </>
  );
}
