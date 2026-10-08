import { booking, site } from "../_lib/content";
import { BookingForm } from "./booking-form";
import { Eyebrow } from "./button";
import { Clock, Mail, Phone, Pin, Shield } from "./icons";
import { Reveal, SplitHeading } from "./reveal";

export function Booking() {
  return (
    <section id="rendez-vous" className="bg-paper-deep">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-28 md:grid-cols-12 md:gap-8 md:px-8 md:py-40">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Reveal>
              <Eyebrow>{booking.eyebrow}</Eyebrow>
            </Reveal>
            <SplitHeading
              text={booking.title}
              className="display mt-7 text-[clamp(2.5rem,5.4vw,4.5rem)]"
            />
            <Reveal delay={0.1}>
              <p className="prose-fr mt-7 max-w-md text-lg leading-relaxed text-ink-soft">{booking.lead}</p>

              <ul className="mt-10 space-y-4 text-[0.95rem] text-ink-soft">
                <li className="flex items-start gap-3">
                  <Shield className="mt-0.5 shrink-0 text-xl text-brass" />
                  Vos informations sont couvertes par le secret professionnel.
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 shrink-0 text-xl text-brass" />
                  <a href={`tel:${site.phoneHref}`} className="link-draw text-ink">{site.phone}</a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 shrink-0 text-xl text-brass" />
                  <a href={`mailto:${site.email}`} className="link-draw text-ink">{site.email}</a>
                </li>
                <li className="flex items-start gap-3">
                  <Pin className="mt-0.5 shrink-0 text-xl text-brass" />
                  <span>
                    {site.address.street}, {site.address.postalCode} {site.address.city}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 shrink-0 text-xl text-brass" />
                  <span>
                    {site.hours.map((h) => (
                      <span key={h.days} className="block">
                        {h.days} · {h.time}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        <div className="min-w-0 md:col-span-7">
          <Reveal>
            <div className="rounded-[2.25rem] bg-ink/[0.05] p-2 ring-1 ring-ink/10">
              <div className="relative rounded-[calc(2.25rem-0.5rem)] bg-paper-card p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.85)] sm:p-9">
                <BookingForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
