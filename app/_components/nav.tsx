"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { nav, type SiteContent } from "../_lib/content";
import { Mail, Phone, Scales } from "./icons";

const EASE = [0.23, 1, 0.32, 1] as const;

type Site = SiteContent["site"];

/** Lien interne : `<Link>` (navigation sans rechargement) pour les chemins, `<a>` pour les ancres. */
function Anchor({ href = "", ...rest }: ComponentProps<"a">) {
  return href.startsWith("/") ? <Link href={href} prefetch={false} {...rest} /> : <a href={href} {...rest} />;
}
const MotionAnchor = motion.create(Anchor);

function Logo({ site, className = "" }: { site: Site; className?: string }) {
  return (
    <span className={`flex items-center gap-3 text-white ${className}`}>
      <Scales className="text-[2.4rem]" />
      <span className="flex flex-col leading-none">
        <span className="display text-[1.55rem]">{site.name}</span>
        <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-white/70">{site.title}</span>
      </span>
    </span>
  );
}

/** Section visible à l'écran, pour souligner l'entrée de menu correspondante. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState("#top");
  useEffect(() => {
    if (!enabled) return;
    const ids = nav.map((n) => n.href.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(`#${e.target.id}`);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

/** `home` : vrai sur la page d'accueil (ancres + défilement doux), faux ailleurs (liens vers l'accueil). */
export function Nav({ site, home = true }: { site: Site; home?: boolean }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const sectionActive = useActiveSection(home);
  const active = home ? sectionActive : pathname.startsWith("/actualites") ? "/actualites" : "";

  // La barre compacte apparaît quand l'en-tête complet a quitté l'écran.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((href: string) => {
    setOpen(false);
    // Le défilement est verrouillé tant que le menu est ouvert : on attend la levée du verrou.
    requestAnimationFrame(() => {
      if (href === "#top") window.scrollTo({ top: 0, behavior: "smooth" });
      else document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href === "#top" ? location.pathname : href);
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

  const link = (href: string) => {
    // Une autre page du site : navigation normale.
    if (href.startsWith("/")) return { href, onClick: () => setOpen(false) };
    // Une ancre depuis une page qui n'est pas l'accueil : on retourne à l'accueil, à cette ancre.
    if (!home) return { href: `/${href}`, onClick: () => setOpen(false) };
    // Une ancre de l'accueil : défilement doux.
    return {
      href,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        goTo(href);
      },
    };
  };

  return (
    <header>
      {/* ---------- En-tête complet (bureau) ---------- */}
      <div ref={headerRef} id="top" className="hidden lg:block">
        <div className="relative flex bg-white">
          {/* Panneau bleu en biais qui déborde jusqu'au bord gauche de l'écran */}
          <div
            className="slant-right flex shrink-0 items-center bg-brass py-8"
            style={{
              width: "max(25rem, calc((100vw - 80rem) / 2 + 25rem))",
              paddingLeft: "max(2rem, calc((100vw - 80rem) / 2 + 2rem))",
            }}
          >
            <Anchor {...link("#top")} aria-label={`${site.name}, accueil`} className="press">
              <Logo site={site} />
            </Anchor>
          </div>

          <div className="flex flex-1 flex-col justify-center pr-[max(2rem,calc((100vw-80rem)/2+2rem))] pl-10">
            <div className="flex items-center justify-between border-b border-ink/10 pb-2.5 text-xs text-ink-soft">
              <ul className="flex gap-5">
                <li><Anchor {...link("#top")} className="link-draw hover:text-ink">Accueil</Anchor></li>
                <li><Anchor {...link("#cabinet")} className="link-draw hover:text-ink">Le cabinet</Anchor></li>
                <li><Anchor {...link("#rendez-vous")} className="link-draw hover:text-ink">Contact</Anchor></li>
              </ul>
              <p>{site.barreau}</p>
            </div>
            <div className="flex items-center justify-end gap-9 pt-4">
              <a href={`tel:${site.phoneHref}`} className="group flex items-center gap-3">
                <span className="grid size-9 place-items-center border border-brass text-lg text-brass transition-colors duration-200 group-hover:bg-brass group-hover:text-white">
                  <Phone />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-ink">Appelez-nous</span>
                  <span className="block text-xs text-ink-soft">{site.phone}</span>
                </span>
              </a>
              <a href={`mailto:${site.email}`} className="group flex items-center gap-3">
                <span className="grid size-9 place-items-center border border-brass text-lg text-brass transition-colors duration-200 group-hover:bg-brass group-hover:text-white">
                  <Mail />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-ink">Écrivez-nous</span>
                  <span className="block text-xs text-ink-soft">{site.email}</span>
                </span>
              </a>
              <Anchor
                {...link("#rendez-vous")}
                className="press bg-brass px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-brass-dark"
              >
                Prendre rendez-vous
              </Anchor>
            </div>
          </div>
        </div>

        {/* Barre de navigation sombre */}
        <nav aria-label="Navigation principale" className="bg-white">
          <div className="slant-left ml-[max(1rem,calc((100vw-80rem)/2))] bg-night">
            <ul className="mx-auto flex max-w-7xl items-center gap-1 px-8 text-[0.8rem] font-semibold text-white/85">
              {nav.map((item) => (
                <li key={item.href} className="relative">
                  <Anchor
                    {...link(item.href)}
                    aria-current={active === item.href ? "location" : undefined}
                    className={`block px-4 py-4 transition-colors duration-200 hover:text-white ${active === item.href ? "text-brass-bright" : ""}`}
                  >
                    {item.label}
                  </Anchor>
                  {active === item.href ? (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-4 bottom-0 h-[3px] bg-brass-bright"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.45 }}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Réserve la place de la barre fixe sur mobile */}
      <div className="h-16 lg:hidden" aria-hidden="true" />

      {/* ---------- Barre fixe : toujours sur mobile, après défilement sur bureau ---------- */}
      <div
        className={`glass fixed inset-x-0 top-0 z-40 bg-night/95 shadow-[0_6px_24px_-10px_rgb(0_0_0/0.5)] backdrop-blur-md transition-transform duration-300 ease-[var(--ease-out)] ${
          stuck ? "translate-y-0" : "lg:-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Anchor {...link("#top")} aria-label={`${site.name}, retour en haut`} className="press">
            <Logo site={site} className="[&_svg]:text-[2rem] [&_.display]:text-[1.3rem]" />
          </Anchor>

          <ul className="hidden items-center gap-1 text-[0.8rem] font-semibold text-white/85 lg:flex" aria-label="Navigation compacte">
            {nav.map((item) => (
              <li key={item.href}>
                <Anchor
                  {...link(item.href)}
                  tabIndex={stuck ? 0 : -1}
                  className={`block px-3 py-2 transition-colors duration-200 hover:text-white ${active === item.href ? "text-brass-bright" : ""}`}
                >
                  {item.label}
                </Anchor>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Anchor
              {...link("#rendez-vous")}
              tabIndex={stuck ? 0 : undefined}
              className="press hidden bg-brass px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-200 hover:bg-brass-dark sm:block"
            >
              Rendez-vous
            </Anchor>
            <button
              ref={burger}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              className="press relative grid size-11 place-items-center bg-brass text-white lg:hidden"
            >
              <motion.span
                className="absolute h-0.5 w-5 bg-current"
                animate={{ y: open ? 0 : -5, rotate: open ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
              <motion.span
                className="absolute h-0.5 w-5 bg-current"
                animate={{ opacity: open ? 0 : 1 }}
                transition={{ duration: 0.15 }}
              />
              <motion.span
                className="absolute h-0.5 w-5 bg-current"
                animate={{ y: open ? 0 : 5, rotate: open ? -45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Menu mobile plein écran ---------- */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[35] flex flex-col justify-between bg-night px-6 pb-10 pt-24 text-white lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <ul>
              {nav.map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-white/10">
                  <MotionAnchor
                    {...link(item.href)}
                    className={`display block py-3.5 text-[2rem] ${active === item.href ? "text-brass-bright" : ""}`}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{ duration: 0.55, ease: EASE, delay: 0.06 + i * 0.05 }}
                  >
                    {item.label}
                  </MotionAnchor>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.35 }}
              className="space-y-4"
            >
              <Anchor
                {...link("#rendez-vous")}
                className="press block bg-brass px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.12em] text-white"
              >
                Prendre rendez-vous
              </Anchor>
              <a href={`tel:${site.phoneHref}`} className="flex items-center justify-center gap-2 py-2 text-white/80">
                <Phone /> {site.phone}
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
