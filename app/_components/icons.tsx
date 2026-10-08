import type { SVGProps } from "react";

/** Icônes au trait fin (1.25) : volontairement discrètes. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const ArrowUpRight = (p: P) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </Icon>
);
export const ArrowRight = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const Family = (p: P) => (
  <Icon {...p}>
    <circle cx="8" cy="7" r="2.5" />
    <circle cx="16.5" cy="9" r="2" />
    <path d="M3.5 19c.4-3.2 2.2-5 4.5-5s4.1 1.8 4.5 5M14 19c.3-2.2 1.4-3.5 2.9-3.5s2.6 1.3 2.9 3.5" />
  </Icon>
);
export const Work = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
    <path d="M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5M3.5 12.5h17" />
  </Icon>
);
export const Scales = (p: P) => (
  <Icon {...p}>
    <path d="M12 4v16M7 20h10M5 7h14" />
    <path d="M5 7 2.5 13a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z" />
  </Icon>
);
export const Property = (p: P) => (
  <Icon {...p}>
    <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5" />
  </Icon>
);
export const Phone = (p: P) => (
  <Icon {...p}>
    <path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
  </Icon>
);
export const Mail = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Icon>
);
export const Pin = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.2" />
  </Icon>
);
export const Clock = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);
export const Shield = (p: P) => (
  <Icon {...p}>
    <path d="M12 3.5 5 6v5.5c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-2.5Z" />
    <path d="m9 12 2.2 2.2L15.2 10" />
  </Icon>
);

export const Layers = (p: P) => (
  <Icon {...p}>
    <path d="m12 4 8.5 4.5L12 13 3.5 8.5 12 4Z" />
    <path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5" />
  </Icon>
);
export const Search = (p: P) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15 15 5 5" />
  </Icon>
);
export const User = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20c.6-3.8 3.1-6 7-6s6.4 2.2 7 6" />
  </Icon>
);
export const ChevronUp = (p: P) => (
  <Icon {...p} strokeWidth={2.2}>
    <path d="m5 15 7-7 7 7" />
  </Icon>
);
export const Check = (p: P) => (
  <Icon {...p} strokeWidth={1.75}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);
export const Quote = (p: P) => (
  <Icon {...p} strokeWidth={1.25}>
    <path d="M9.5 7C6.5 7.8 5 10 5 13v4h5v-5H7.5c0-2 .8-3.3 2-4ZM19 7c-3 .8-4.5 3-4.5 6v4h5v-5H17c0-2 .8-3.3 2-4Z" />
  </Icon>
);
