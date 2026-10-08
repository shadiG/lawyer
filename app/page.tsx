import { About } from "./_components/about";
import { Booking } from "./_components/booking";
import { Fees } from "./_components/fees";
import { Footer } from "./_components/footer";
import { Hero } from "./_components/hero";
import { Nav } from "./_components/nav";
import { Practices } from "./_components/practices";
import { Process } from "./_components/process";
import { site } from "./_lib/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LegalService",
  name: site.name,
  description: `${site.lawyer}, ${site.title}`,
  url: site.url,
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

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // Échappement de « < » pour qu’aucune balise ne puisse clore le script.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Nav />
      <main id="contenu">
        <Hero />
        <About />
        <Practices />
        <Process />
        <Fees />
        <Booking />
      </main>
      <Footer />
    </>
  );
}
