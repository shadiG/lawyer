"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import type { SiteContent } from "../_lib/content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

export function Process({ steps }: { steps: SiteContent["steps"] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  // Le ressort lisse le défilement : la ligne « rattrape » sans saccade.
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  return (
    <section id="deroule" className="on-night bg-night text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <SectionHeading title="Le déroulé" subtitle="Trois étapes, sans zone d’ombre." tone="dark" />

        <ol
          ref={ref}
          className="relative mt-16 grid gap-12 lg:gap-10"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 16rem), 1fr))` }}
        >
          {/* Rail horizontal (bureau) avec progression liée au scroll */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-7 hidden h-px bg-white/15 lg:block">
            <motion.div className="h-full origin-left bg-brass-bright" style={{ scaleX: progress }} />
          </div>

          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <Reveal delay={i * 0.1}>
                <span className="relative z-10 grid size-14 place-items-center bg-brass font-serif text-xl font-bold shadow-[5px_5px_0_rgb(255_255_255/0.12)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-6 text-[1.4rem]">{step.title}</h3>
                <p className="prose-fr mt-3 leading-relaxed text-white/65">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
