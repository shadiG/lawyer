import type { SiteContent } from "../_lib/content";
import { BookingForm } from "./booking-form";
import { Clock, Mail, Phone, Pin, Shield } from "./icons";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

export function Booking({ booking, site }: { booking: SiteContent["booking"]; site: SiteContent["site"] }) {
  return (
    <section id="rendez-vous" className="bg-paper-deep">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading title="Prendre rendez-vous" subtitle={`${booking.title} ${booking.lead}`} />

        <div className="mt-14 grid gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="on-night h-full bg-brass p-8 text-white md:p-10">
              <h3 className="display text-[1.5rem]">Nous contacter</h3>
              <span className="mt-3 block h-[3px] w-10 bg-white/60" />
              <ul className="mt-8 space-y-6 text-[0.95rem]">
                <li className="flex items-start gap-4">
                  <Shield className="mt-0.5 shrink-0 text-2xl text-white/80" />
                  <span className="text-white/85">Vos informations sont couvertes par le secret professionnel.</span>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="mt-0.5 shrink-0 text-2xl text-white/80" />
                  <a href={`tel:${site.phoneHref}`} className="link-draw">{site.phone}</a>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="mt-0.5 shrink-0 text-2xl text-white/80" />
                  <a href={`mailto:${site.email}`} className="link-draw break-all">{site.email}</a>
                </li>
                <li className="flex items-start gap-4">
                  <Pin className="mt-0.5 shrink-0 text-2xl text-white/80" />
                  <span>
                    {site.address.street}
                    <br />
                    {site.address.postalCode} {site.address.city}
                  </span>
                </li>
                <li className="flex items-start gap-4">
                  <Clock className="mt-0.5 shrink-0 text-2xl text-white/80" />
                  <span>
                    {site.hours.map((h) => (
                      <span key={h.days} className="block">
                        {h.days} · {h.time}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>

          <Reveal className="min-w-0 lg:col-span-8" delay={0.08}>
            <div className="relative bg-white p-6 shadow-[0_24px_50px_-28px_rgb(18_22_29/0.4)] ring-1 ring-ink/[0.07] sm:p-9">
              <BookingForm motifs={booking.motifs} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
