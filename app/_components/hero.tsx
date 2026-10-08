"use client";

import { motion } from "motion/react";
import type { SiteContent } from "../_lib/content";
import { Button } from "./button";
import { Layers, Search, User } from "./icons";
import { Portrait } from "./portrait";
import { RichBlock } from "./rich";

const EASE = [0.23, 1, 0.32, 1] as const;
const highlightIcons = [Layers, Search, User];

/** Met en bleu la fin de la phrase : après la dernière virgule, sinon les deux derniers mots. */
function splitTitle(title: string): [string, string] {
  const comma = title.lastIndexOf(",");
  if (comma > 0) return [title.slice(0, comma + 1), title.slice(comma + 1).trim()];
  const words = title.split(" ");
  if (words.length < 3) return [title, ""];
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}

export function Hero({ hero, site }: { hero: SiteContent["hero"]; site: SiteContent["site"] }) {
  const [lead, accent] = splitTitle(hero.title);

  return (
    <section className="relative">
      {/* Fond clair sobre, en biais comme la maquette */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#eef1f6,#e4e9f1)]">
        <div className="absolute -right-24 top-0 h-full w-2/3 -skew-x-12 bg-white/55" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-32 pt-12 md:px-8 lg:min-h-[34rem] lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-14">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="display text-[1.5rem] text-brass">{hero.eyebrow}</p>
            <span className="mt-2 block h-[3px] w-14 bg-brass" />
          </motion.div>

          <motion.h1
            className="display mt-6 text-[clamp(2.4rem,5.6vw,4.4rem)] text-ink"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
          >
            {lead} {accent ? <span className="text-brass">{accent}</span> : null}
          </motion.h1>

          <motion.div
            className="prose-fr mt-6 max-w-xl text-[1.08rem] leading-relaxed text-ink-soft"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <RichBlock value={hero.lead} />
          </motion.div>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.32 }}
          >
            <Button href="#rendez-vous">Prendre rendez-vous</Button>
            <Button href="#cabinet" variant="outline" icon={false}>
              Découvrir le cabinet
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none lg:pl-10"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        >
          <Portrait site={site} className="aspect-[4/4.6] w-full lg:ml-auto lg:max-w-md" />
        </motion.div>
      </div>

      {/* Bandeau bleu des atouts, à cheval sur le bas du hero */}
      <div className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 md:px-8 lg:-mt-24">
        <motion.ul
          className="grid gap-px bg-white/15 bg-brass shadow-[0_24px_50px_-24px_rgb(11_73_179/0.6)] md:grid-cols-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
        >
          {hero.highlights.slice(0, 3).map((h, i) => {
            const Icon = highlightIcons[i % highlightIcons.length];
            return (
              <li key={h.title} className="flex items-start gap-5 bg-brass px-7 py-8 text-white">
                {/* Pastille blanche avec ombre décalée, comme la maquette */}
                <span className="relative grid size-14 shrink-0 place-items-center bg-white text-[1.6rem] text-brass shadow-[5px_5px_0_rgb(255_255_255/0.28)]">
                  <Icon />
                </span>
                <span>
                  <span className="display block text-[1.15rem]">{h.title}</span>
                  <span className="mt-1.5 block text-[0.88rem] leading-relaxed text-white/80">{h.text}</span>
                </span>
              </li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
