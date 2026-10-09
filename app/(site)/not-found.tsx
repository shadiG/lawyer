import { Footer } from "../_components/footer";
import { Nav } from "../_components/nav";
import { NotFoundContent } from "../_components/not-found-content";
import { getContent } from "../_lib/cms";

/** 404 à l'intérieur du site (par exemple un article inexistant ou encore en brouillon) : avec le menu et le pied de page. */
export default async function NotFound() {
  const { site } = await getContent();
  return (
    <>
      <Nav site={site} home={false} />
      <main id="contenu">
        <NotFoundContent />
      </main>
      <Footer site={site} />
    </>
  );
}
