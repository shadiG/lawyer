"use client";

import { useRef } from "react";
import type { PracticeIcon, SiteContent } from "../_lib/content";
import { Button, Eyebrow } from "./button";
import { Family, Property, Scales, Work } from "./icons";
import { Reveal, SplitHeading } from "./reveal";

const icons: Record<PracticeIcon, React.ComponentType<{ className?: string }>> = {
  family: Family,
  work: Work,
  criminal: Scales,
  property: Property,
};

// Bento asymétrique : 7/5 puis 5/7 sur grand écran, pile sur mobile.
const spans = ["md:col-span-7", "md:col-span-5", "md:col-span-5", "md:col-span-7"];

function Card({ practice, className }: { practice: SiteContent["practices"][number]; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = icons[practice.icon];

  // Le halo suit le curseur : variables posées sur la carte seule, hors rendu React.
  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <Reveal className={className}>
      {/* Double enveloppe : plateau extérieur + cœur intérieur aux rayons concentriques */}
      <div className="group h-full rounded-[2rem] bg-ink/[0.045] p-1.5 ring-1 ring-ink/10">
        <div
          ref={ref}
          onPointerMove={onMove}
          className="relative h-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-paper-card p-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] md:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(360px circle at var(--mx, 50%) var(--my, 0%), rgb(195 160 116 / 0.22), transparent 70%)",
            }}
          />
          <div className="relative flex h-full flex-col">
            <span className="grid size-12 place-items-center rounded-full bg-ink/[0.05] text-2xl text-brass ring-1 ring-ink/10">
              <Icon />
            </span>
            <h3 className="display mt-8 text-[clamp(1.75rem,3vw,2.5rem)]">{practice.title}</h3>
            <p className="prose-fr mt-4 max-w-md leading-relaxed text-ink-soft">{practice.text}</p>
            <ul className="mt-8 space-y-2.5 border-t border-ink/10 pt-6 text-[0.95rem] text-ink">
              {practice.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-[0.6em] h-px w-4 shrink-0 bg-brass" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function Practices({ practices }: { practices: SiteContent["practices"] }) {
  return (
    <section id="domaines" className="mx-auto max-w-7xl px-4 pb-28 md:px-8 md:pb-40">
      <div className="mb-14 max-w-3xl md:mb-20">
        <Reveal>
          <Eyebrow>Domaines d’intervention</Eyebrow>
        </Reveal>
        <SplitHeading
          text="Votre situation a un nom. Elle a aussi une solution."
          className="display mt-7 text-[clamp(2.25rem,5vw,4.25rem)]"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-12">
        {practices.map((p, i) => (
          <Card key={p.id} practice={p} className={spans[i % spans.length]} />
        ))}
      </div>

      <Reveal className="mt-5">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink/[0.045] p-1.5 ring-1 ring-ink/10 md:flex-row md:items-center">
          <p className="prose-fr px-6 pt-4 text-lg text-ink-soft md:pb-4 md:pt-4">
            Votre sujet ne figure pas dans cette liste ? Décrivez-le, nous vous dirons honnêtement si le cabinet peut vous aider.
          </p>
          <Button href="#rendez-vous" variant="ink" className="m-1.5 shrink-0">
            Exposer ma situation
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
