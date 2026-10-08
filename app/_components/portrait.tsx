import Image from "next/image";
import type { SiteContent } from "../_lib/content";

/**
 * Portrait en arche. Avec une photo (médiathèque de l'admin) : la photo seule,
 * avec un léger voile en bas. Sans photo : une arche illustrée avec monogramme.
 */
export function Portrait({ site, className = "" }: { site: SiteContent["site"]; className?: string }) {
  return (
    <div
      className={`rounded-t-[999px] rounded-b-[2rem] bg-ink/[0.05] p-2 ring-1 ring-ink/10 ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-t-[calc(999px-0.5rem)] rounded-b-[calc(2rem-0.5rem)] bg-night shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]">
        {site.portraitUrl ? (
          <>
            <Image
              src={site.portraitUrl}
              alt={site.portraitAlt ?? `Portrait de ${site.lawyer}`}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-night/40 to-transparent" />
          </>
        ) : (
          <>
            {/* Lumière chaude venant du haut */}
            <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,rgb(195_160_116/0.55),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_100%,rgb(122_90_50/0.35),transparent_70%)]" />

            {/* Arcs concentriques fins */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 560"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              fill="none"
              stroke="rgb(245 240 230)"
              strokeOpacity="0.14"
              strokeWidth="1"
            >
              {[150, 120, 90, 60].map((r) => (
                <path key={r} d={`M${200 - r} 560V${230}a${r} ${r} 0 0 1 ${r * 2} 0V560`} />
              ))}
            </svg>

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 pb-10 text-paper">
              <span className="display text-[5.5rem] leading-none">{site.monogram}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.3em] text-paper/70">{site.barreau}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
