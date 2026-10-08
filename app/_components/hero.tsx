"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { hero, site } from "../_lib/content";
import { Button, Eyebrow } from "./button";
import { Clock, Shield } from "./icons";
import { Portrait } from "./portrait";
import { SplitHeading } from "./reveal";

const EASE = [0.23, 1, 0.32, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Parallaxe légère : le portrait remonte moins vite que la page.
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative mx-auto grid min-h-[100dvh] max-w-7xl overflow-x-clip items-center gap-12 px-4 pb-20 pt-32 md:grid-cols-12 md:gap-8 md:px-8 md:pt-36 lg:pb-28"
    >
      {/* Halo chaud, décoratif et statique */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(195_160_116/0.28),transparent)]"
      />

      <motion.div style={{ y: textY }} className="relative md:col-span-7">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Eyebrow>{hero.eyebrow}</Eyebrow>
        </motion.div>

        <SplitHeading
          as="h1"
          immediate
          delay={0.15}
          text={hero.title}
          className="display mt-8 text-[clamp(2.9rem,8.2vw,6.6rem)]"
        />

        <motion.p
          className="prose-fr mt-8 max-w-xl text-lg leading-relaxed text-ink-soft"
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.7 }}
        >
          {hero.lead}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
        >
          <Button href="#rendez-vous">Prendre rendez-vous</Button>
          <a href="#cabinet" className="link-draw py-1 text-[0.95rem] text-ink-soft hover:text-ink">
            Découvrir le cabinet
          </a>
        </motion.div>

        <motion.ul
          className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-soft"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 1.1 }}
        >
          <li className="flex items-center gap-2">
            <Shield className="text-lg text-brass" /> Secret professionnel
          </li>
          <li className="flex items-center gap-2">
            <Clock className="text-lg text-brass" /> Réponse sous {site.responseTime}
          </li>
        </motion.ul>
      </motion.div>

      <motion.div
        style={{ y: portraitY }}
        className="relative mx-auto w-full max-w-sm md:col-span-5 md:max-w-none"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
      >
        <Portrait className="aspect-[4/5.4] w-full" />
        <div className="glass absolute -bottom-5 -left-3 rounded-2xl bg-paper/80 px-5 py-4 shadow-[0_18px_50px_-18px_rgb(20_24_29/0.3),inset_0_1px_0_rgb(255_255_255/0.7)] ring-1 ring-ink/10 backdrop-blur-xl md:-left-10">
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">Consultations</p>
          <p className="mt-1 text-sm text-ink">Au cabinet, en visio ou par téléphone</p>
        </div>
      </motion.div>
    </section>
  );
}
