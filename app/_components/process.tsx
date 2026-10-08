"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import type { SiteContent } from "../_lib/content";
import { Eyebrow } from "./button";
import { Reveal, SplitHeading } from "./reveal";

export function Process({ steps }: { steps: SiteContent["steps"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  // Le ressort lisse le défilement : la ligne « rattrape » le doigt sans saccade.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <section
      id="deroule"
      className="on-night mx-2 rounded-[2rem] bg-night text-paper md:mx-4 md:rounded-[3rem]"
    >
      <div className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-40">
        <div className="max-w-3xl">
          <Reveal>
            <Eyebrow tone="night">Le déroulé</Eyebrow>
          </Reveal>
          <SplitHeading
            text="Trois étapes, sans zone d’ombre."
            className="display mt-7 text-[clamp(2.25rem,5vw,4.25rem)]"
          />
        </div>

        <div ref={ref} className="relative mt-20 md:mt-28">
          {/* Rail + progression */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.1rem] top-0 w-px bg-paper/15 md:left-[calc(16.666%-0.5px)]"
          >
            <motion.div
              className="h-full w-full origin-top bg-brass-bright"
              style={{ scaleY: progress }}
            />
          </div>

          <ol className="space-y-16 md:space-y-28">
            {steps.map((step, i) => (
              <li key={step.title} className="relative grid gap-4 pl-12 md:grid-cols-12 md:gap-8 md:pl-0">
                <span
                  aria-hidden="true"
                  className="absolute left-[0.7rem] top-3 size-2.5 rounded-full bg-night ring-2 ring-brass-bright md:left-[calc(16.666%-0.3rem)]"
                />
                <Reveal className="md:col-span-2 md:pr-10 md:text-right">
                  <span className="display text-[clamp(3rem,6vw,5rem)] text-brass-bright">{String(i + 1).padStart(2, "0")}</span>
                </Reveal>
                <Reveal delay={0.08} className="md:col-span-7 md:col-start-4">
                  <h3 className="display text-[clamp(1.75rem,3.2vw,2.75rem)]">{step.title}</h3>
                  <p className="prose-fr mt-4 max-w-xl text-lg leading-relaxed text-paper/70">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
