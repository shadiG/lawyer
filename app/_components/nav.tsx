"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { nav, site } from "../_lib/content";
import { Phone } from "./icons";

const EASE = [0.32, 0.72, 0, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const burger = useRef<HTMLButtonElement>(null);

  const goTo = useCallback((href: string) => {
    setOpen(false);
    // Le défilement est verrouillé tant que le menu est ouvert : on attend
    // que le verrou soit levé avant de se déplacer.
    requestAnimationFrame(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burger.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-4 z-40 flex justify-center px-4 md:top-6">
      <nav
        aria-label="Navigation principale"
        className="glass relative z-10 flex items-center gap-1 rounded-full bg-paper/70 py-1.5 pl-5 pr-1.5 shadow-[0_10px_40px_-14px_rgb(20_24_29/0.22),inset_0_1px_0_rgb(255_255_255/0.6)] ring-1 ring-ink/10 backdrop-blur-xl backdrop-saturate-150"
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="press mr-2 flex items-baseline gap-2 pr-2"
          aria-label={`${site.name}, retour en haut`}
        >
          <span className="display text-[1.35rem] leading-none">{site.monogram}</span>
          <span className="hidden text-[0.7rem] uppercase tracking-[0.18em] text-ink-soft sm:inline">
            {site.name}
          </span>
        </a>

        <ul className="hidden items-center md:flex" onPointerLeave={() => setHovered(null)}>
          {nav.map((item) => (
            <li key={item.href} className="relative">
              <a
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(item.href);
                }}
                onPointerEnter={() => setHovered(item.href)}
                onFocus={() => setHovered(item.href)}
                onBlur={() => setHovered(null)}
                className="relative z-10 block px-4 py-2 text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
              >
                {item.label}
              </a>
              {hovered === item.href ? (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-full bg-ink/[0.06]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              ) : null}
            </li>
          ))}
        </ul>

        <a
          href="#rendez-vous"
          onClick={(e) => {
            e.preventDefault();
            goTo("#rendez-vous");
          }}
          className="press ml-1 hidden rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper md:block"
        >
          Rendez-vous
        </a>

        <button
          ref={burger}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="press relative ml-3 grid size-10 place-items-center rounded-full bg-ink text-paper md:hidden"
        >
          <motion.span
            className="absolute h-px w-4 bg-current"
            animate={{ y: open ? 0 : -3.5, rotate: open ? 45 : 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
          <motion.span
            className="absolute h-px w-4 bg-current"
            animate={{ y: open ? 0 : 3.5, rotate: open ? -45 : 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="glass fixed inset-0 flex flex-col justify-between bg-paper/90 px-6 pb-10 pt-28 backdrop-blur-3xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <ul className="space-y-1">
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(item.href);
                    }}
                    className="display block py-2 text-[2.75rem]"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.08 + i * 0.06 }}
                  >
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
              className="space-y-4"
            >
              <a
                href="#rendez-vous"
                onClick={(e) => {
                  e.preventDefault();
                  goTo("#rendez-vous");
                }}
                className="press block rounded-full bg-ink px-6 py-4 text-center font-medium text-paper"
              >
                Demander un rendez-vous
              </a>
              <a
                href={`tel:${site.phoneHref}`}
                className="flex items-center justify-center gap-2 py-2 text-ink-soft"
              >
                <Phone /> {site.phone}
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
