"use client";

import { motion } from "motion/react";
import { Fragment } from "react";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Entrée au scroll : montée douce + flou qui se résorbe.
 * Uniquement transform / opacity / filter, déclenchée une seule fois.
 */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Titre révélé mot à mot, chaque mot sortant d’un masque. */
export function SplitHeading({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  immediate = false,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  /** true : joue au chargement (hero) ; sinon au scroll. */
  immediate?: boolean;
}) {
  const words = text.split(" ");
  const trigger = immediate
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, margin: "0px 0px -15% 0px" } };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        className="inline"
        initial="hidden"
        variants={{ show: { transition: { staggerChildren: 0.055, delayChildren: delay } } }}
        {...trigger}
      >
        {words.map((word, i) => (
          <Fragment key={i}>
            {/* Le padding/margin négatif évite de rogner les jambages dans le masque. */}
            <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-top">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { y: "110%" },
                  show: { y: "0%", transition: { duration: 0.9, ease: EASE } },
                }}
              >
                {word}
              </motion.span>
            </span>
            {/* Espace normale hors du masque : le titre peut revenir à la ligne. */}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
