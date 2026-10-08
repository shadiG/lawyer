"use client";

import { MotionConfig } from "motion/react";

/** Respecte `prefers-reduced-motion` : déplacements retirés, fondus conservés. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
