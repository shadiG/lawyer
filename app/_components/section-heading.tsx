import { ChevronUp } from "./icons";
import { Reveal } from "./reveal";

/** Titre de section centré : chevron, titre en capitales, trait bleu, sous-titre. */
export function SectionHeading({
  title,
  subtitle,
  tone = "light",
}: {
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <ChevronUp className={`mx-auto text-[2.1rem] ${dark ? "text-brass-bright" : "text-brass"}`} />
      <h2 className={`display mt-1 text-[1.65rem] uppercase tracking-[0.03em] md:text-[1.9rem] ${dark ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      <span className={`mx-auto mt-4 block h-[3px] w-12 ${dark ? "bg-brass-bright" : "bg-brass"}`} />
      {subtitle ? (
        <p className={`prose-fr mt-5 text-[1.05rem] leading-relaxed ${dark ? "text-white/65" : "text-ink-faint"}`}>
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
