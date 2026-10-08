import Link from "next/link";
import { nav, siteYear, type SiteContent } from "../_lib/content";
import { Clock, Mail, Phone, Pin, Scales } from "./icons";

export function Footer({ site }: { site: SiteContent["site"] }) {
  return (
    <footer className="on-night border-t-4 border-brass bg-night text-white">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 md:px-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <span className="flex items-center gap-3">
              <Scales className="text-[2.4rem] text-brass-bright" />
              <span className="display text-[1.6rem]">{site.name}</span>
            </span>
            <p className="prose-fr mt-5 max-w-xs leading-relaxed text-white/60">
              {site.lawyer}, {site.title.toLowerCase()}. {site.barreau}.
            </p>
          </div>

          <address className="not-italic md:col-span-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass-bright">Contact</p>
            <ul className="mt-5 space-y-3.5 text-white/80">
              <li className="flex items-start gap-3">
                <Pin className="mt-1 shrink-0 text-lg text-brass-bright" />
                <span>
                  {site.address.street}, {site.address.postalCode} {site.address.city}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-1 shrink-0 text-lg text-brass-bright" />
                <a href={`tel:${site.phoneHref}`} className="link-draw">{site.phone}</a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 shrink-0 text-lg text-brass-bright" />
                <a href={`mailto:${site.email}`} className="link-draw break-all">{site.email}</a>
              </li>
            </ul>
          </address>

          <div className="md:col-span-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brass-bright">Horaires</p>
            <ul className="mt-5 space-y-3.5 text-white/80">
              {site.hours.map((h) => (
                <li key={h.days} className="flex items-start gap-3">
                  <Clock className="mt-1 shrink-0 text-lg text-brass-bright" />
                  <span>
                    {h.days} <span className="text-white/50">· {h.time}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-7 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {siteYear} {site.lawyer}. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {nav.slice(1, 6).map((n) => (
              <li key={n.href}>
                <Link href={n.href.startsWith("#") ? `/${n.href}` : n.href} className="link-draw hover:text-white">{n.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/mentions-legales" className="link-draw hover:text-white">Mentions légales</Link>
            </li>
            <li>
              <Link href="/confidentialite" className="link-draw hover:text-white">Confidentialité</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
