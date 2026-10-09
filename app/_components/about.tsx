"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { SiteContent } from "../_lib/content";
import { Quote, Scales, Shield } from "./icons";
import { Reveal } from "./reveal";
import { RichBlock } from "./rich";
import { SectionHeading } from "./section-heading";

const EASE = [0.23, 1, 0.32, 1] as const;

const tabs = [
  { id: "cabinet", label: "Le cabinet", Icon: Scales },
  { id: "reperes", label: "Repères", Icon: Shield },
] as const;

export function About({ about }: { about: SiteContent["about"] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("cabinet");
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Navigation au clavier d'un onglet à l'autre (flèches, Début, Fin).
  function onKeyDown(e: React.KeyboardEvent, index: number) {
    const keys: Record<string, number> = {
      ArrowDown: (index + 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      ArrowUp: (index - 1 + tabs.length) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = tabs[keys[e.key]];
    setTab(next.id);
    refs.current[next.id]?.focus();
  }

  return (
    <section id="cabinet" className="mx-auto max-w-7xl px-4 pb-24 pt-16 md:px-8 md:pb-32 lg:pt-12">
      <SectionHeading title="À propos du cabinet" subtitle={about.title} />

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Onglets */}
        <Reveal className="lg:col-span-3">
          <div role="tablist" aria-label="À propos" aria-orientation="vertical" className="border border-ink/10">
            {tabs.map(({ id, label, Icon }, i) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  ref={(el) => {
                    refs.current[id] = el;
                  }}
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={`relative flex w-full items-center gap-4 px-6 py-5 text-left text-[0.82rem] font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${i > 0 ? "border-t border-ink/10" : ""} ${selected ? "bg-paper-deep text-ink" : "text-ink-soft hover:bg-paper-deep/60"}`}
                >
                  {selected ? (
                    <motion.span
                      layoutId="about-tab"
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-[3px] bg-brass"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                    />
                  ) : null}
                  <Icon className={`text-xl ${selected ? "text-brass" : "text-ink-faint"}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Contenu de l'onglet */}
        <div className="min-h-[15rem] lg:col-span-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              id={`panel-${tab}`}
              aria-labelledby={`tab-${tab}`}
              tabIndex={0}
              initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {tab === "cabinet" ? (
                <RichBlock value={about.body} className="prose-fr space-y-5 leading-relaxed text-ink-soft" />
              ) : (
                <dl className="divide-y divide-ink/10 border-y border-ink/10">
                  {about.facts.map((f) => (
                    <div key={f.label} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-4 py-3.5">
                      <dt className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">{f.label}</dt>
                      <dd className="text-ink">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Citation sur panneau bleu, avec le cadre gris décalé de la maquette */}
        <Reveal className="lg:col-span-4" delay={0.1}>
          <div className="relative">
            <div aria-hidden="true" className="absolute -right-4 -top-4 h-full w-full bg-paper-deep" />
            <figure className="relative flex min-h-[15rem] flex-col justify-between bg-brass p-8 text-white">
              <Quote className="text-5xl text-white/35" />
              <blockquote className="display mt-4 text-[1.55rem] italic leading-snug">{about.quote}</blockquote>
              <figcaption className="mt-6 h-[3px] w-12 bg-white/60" />
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
