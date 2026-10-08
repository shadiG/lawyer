import { ArrowRight } from "./icons";

type Variant = "blue" | "white" | "outline" | "dark";

const styles: Record<Variant, string> = {
  blue: "bg-brass text-white hover:bg-brass-dark",
  white: "bg-white text-brass hover:bg-paper-deep",
  outline: "text-ink ring-1 ring-inset ring-ink/25 hover:bg-ink hover:text-white hover:ring-ink",
  dark: "bg-night text-white hover:bg-black",
};

/** Bouton rectangulaire net : feedback immédiat à la pression, flèche qui avance au survol. */
export function Button({
  href,
  children,
  variant = "blue",
  icon = true,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  icon?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`group press inline-flex items-center justify-center gap-3 rounded-sm px-6 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] transition-colors duration-200 ${styles[variant]} ${className}`}
    >
      {children}
      {icon ? (
        <ArrowRight className="text-base transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-1" />
      ) : null}
    </a>
  );
}
