"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "./icons";

type Variant = "ink" | "paper" | "ghost";

const styles: Record<Variant, { base: string; bubble: string }> = {
  ink: {
    base: "bg-ink text-paper",
    bubble: "bg-paper/15",
  },
  paper: {
    base: "bg-paper text-ink",
    bubble: "bg-ink/10",
  },
  ghost: {
    base: "text-ink ring-1 ring-ink/15 hover:ring-ink/30 bg-transparent",
    bubble: "bg-ink/[0.06]",
  },
};

/**
 * Pilule « bouton dans le bouton » : l’icône vit dans sa propre bulle et se
 * déplace en diagonale au survol. Effet magnétique léger à la souris
 * uniquement (pointeur fin), jamais au toucher.
 */
export function Button({
  href,
  children,
  variant = "ink",
  icon = true,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  icon?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
  const s = styles[variant];

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.18);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.28);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`group press inline-flex items-center gap-3 rounded-full py-2 pl-6 text-[0.95rem] font-medium tracking-[-0.005em] ${icon ? "pr-2" : "pr-6"} ${s.base} ${className}`}
    >
      <span>{children}</span>
      {icon ? (
        <span
          className={`grid size-9 place-items-center rounded-full text-lg transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 ${s.bubble}`}
        >
          <ArrowUpRight />
        </span>
      ) : null}
    </motion.a>
  );
}

/** Pastille de rubrique au-dessus des titres. */
export function Eyebrow({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "night" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.2em] ring-1 ${
        tone === "night" ? "bg-paper/5 text-brass-bright ring-paper/15" : "bg-ink/[0.04] text-brass ring-ink/10"
      }`}
    >
      <span className="size-1 rounded-full bg-current" />
      {children}
    </span>
  );
}
