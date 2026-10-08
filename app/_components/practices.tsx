"use client";

import Image from "next/image";
import type { PracticeIcon, SiteContent } from "../_lib/content";
import { ArrowRight, Check, Family, Property, Scales, Work } from "./icons";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const icons: Record<PracticeIcon, React.ComponentType<{ className?: string }>> = {
  family: Family,
  work: Work,
  criminal: Scales,
  property: Property,
};

function Card({ practice, index }: { practice: SiteContent["practices"][number]; index: number }) {
  const Icon = icons[practice.icon];
  return (
    <Reveal delay={index * 0.07} className="h-full">
      <article className="group relative flex h-full flex-col bg-white shadow-[0_2px_18px_-6px_rgb(18_22_29/0.18)] ring-1 ring-ink/[0.07] transition-[transform,box-shadow] duration-300 ease-[var(--ease-out)] hover:shadow-[0_22px_40px_-18px_rgb(11_73_179/0.35)] motion-safe:hover:-translate-y-1">
        {/* Visuel : photo de l'admin, sinon fond bleu avec l'icône en filigrane */}
        <div className="relative h-44 overflow-hidden bg-brass">
          {practice.imageUrl ? (
            <Image
              src={practice.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-105"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b49b3,#082f78)]" />
              <Icon className="absolute -bottom-6 -right-4 text-[11rem] text-white/[0.12]" />
            </>
          )}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brass-bright transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100" />
        </div>

        <div className="relative flex flex-1 flex-col px-6 pb-7 pt-10">
          <span className="absolute -top-7 left-6 grid size-14 place-items-center bg-white text-[1.6rem] text-brass shadow-[0_8px_20px_-8px_rgb(18_22_29/0.4)]">
            <Icon />
          </span>
          <h3 className="display text-[1.35rem]">{practice.title}</h3>
          <p className="prose-fr mt-3 text-[0.93rem] leading-relaxed text-ink-soft">{practice.text}</p>
          <ul className="mt-5 space-y-2 border-t border-ink/10 pt-5 text-[0.88rem] text-ink">
            {practice.items.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-[0.2em] shrink-0 text-base text-brass" />
                {item}
              </li>
            ))}
          </ul>
          <a
            href="#rendez-vous"
            className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-brass"
          >
            <span className="link-draw">Demander un rendez-vous</span>
            <ArrowRight className="text-base transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1" />
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export function Practices({ practices }: { practices: SiteContent["practices"] }) {
  return (
    <section id="domaines" className="bg-paper-deep">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading
          title="Domaines d’intervention"
          subtitle="Votre situation a un nom. Elle a aussi une solution."
        />
        <div className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {practices.map((p, i) => (
            <Card key={p.id} practice={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
