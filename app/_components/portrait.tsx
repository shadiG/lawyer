import { site } from "../_lib/content";

/**
 * Portrait provisoire : une arche architecturale avec monogramme.
 * Pour une vraie photo, remplacez le contenu de l’arche par un <Image fill />
 * (fichier dans /public) en gardant les mêmes classes d’arrondi.
 */
export function Portrait({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-t-[999px] rounded-b-[2rem] bg-ink/[0.05] p-2 ring-1 ring-ink/10 ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-t-[calc(999px-0.5rem)] rounded-b-[calc(2rem-0.5rem)] bg-night shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]">
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
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-paper/70">
            {site.barreau}
          </span>
        </div>
      </div>
    </div>
  );
}
