"use client";

import { useNav } from "@payloadcms/ui";
import { useEffect } from "react";

const DESKTOP = "(min-width: 1025px)";

/**
 * Comme WordPress, le menu latéral reste ouvert sur grand écran.
 *
 * Payload le referme de lui-même dès que la fenêtre fait 1440 px ou moins, et un
 * menu fermé reçoit l'attribut `inert` (aucun clic possible, impossible à annuler
 * en CSS). On le rouvre donc dès que l'écran est assez large ; en dessous, le menu
 * garde son comportement mobile (bouton hamburger).
 */
export function KeepNavOpen() {
  const { navOpen, setNavOpen } = useNav();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    if (mq.matches && !navOpen) setNavOpen(true);
    const onChange = () => {
      if (mq.matches) setNavOpen(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [navOpen, setNavOpen]);

  return null;
}
