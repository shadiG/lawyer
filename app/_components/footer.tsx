import Link from "next/link";
import { nav, site } from "../_lib/content";

export function Footer() {
  return (
    <footer className="on-night mx-2 mb-2 rounded-[2rem] bg-night text-paper md:mx-4 md:mb-4 md:rounded-[3rem]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 md:px-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <p className="display text-[clamp(2.5rem,6vw,5rem)]">{site.lawyer}</p>
            <p className="mt-3 text-paper/60">
              {site.title} · {site.barreau}
            </p>
          </div>

          <address className="not-italic md:col-span-3">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brass-bright">Cabinet</p>
            <p className="mt-4 leading-relaxed text-paper/80">
              {site.address.street}
              <br />
              {site.address.postalCode} {site.address.city}
            </p>
            <p className="mt-4 space-y-1 leading-relaxed text-paper/80">
              <a href={`tel:${site.phoneHref}`} className="link-draw block w-fit">{site.phone}</a>
              <a href={`mailto:${site.email}`} className="link-draw block w-fit">{site.email}</a>
            </p>
          </address>

          <div className="md:col-span-3">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brass-bright">Horaires</p>
            <ul className="mt-4 space-y-1 leading-relaxed text-paper/80">
              {site.hours.map((h) => (
                <li key={h.days}>
                  {h.days} <span className="text-paper/50">· {h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-paper/12 pt-8 text-sm text-paper/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {site.year} {site.lawyer}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={`/${n.href}`} className="link-draw hover:text-paper">{n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/mentions-legales" className="link-draw hover:text-paper">Mentions légales</Link>
            </li>
            <li>
              <Link href="/confidentialite" className="link-draw hover:text-paper">Confidentialité</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
