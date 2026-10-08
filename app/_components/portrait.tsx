import Image from "next/image";
import type { SiteContent } from "../_lib/content";
import { Scales } from "./icons";

/**
 * Portrait de l'avocat, avec un cadre bleu décalé derrière.
 * Avec une photo (médiathèque de l'admin) : la photo. Sans photo : un panneau
 * illustré avec le monogramme, pour que la page soit complète dès le départ.
 */
export function Portrait({ site, className = "" }: { site: SiteContent["site"]; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className="absolute -bottom-4 -right-4 h-full w-full bg-brass" />
      <div className="relative h-full w-full overflow-hidden bg-night">
        {site.portraitUrl ? (
          <Image
            src={site.portraitUrl}
            alt={site.portraitAlt ?? `Portrait de ${site.lawyer}`}
            fill
            priority
            sizes="(min-width: 1024px) 38vw, 90vw"
            className="object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(160deg,#243044_0%,#16191e_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_0%,rgb(106_160_255/0.28),transparent_65%)]" />
            <Scales className="absolute -right-10 -top-6 text-[18rem] text-white/[0.05]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-8 text-white">
              <span className="display text-[4.5rem] leading-none">{site.monogram}</span>
              <span className="h-[3px] w-12 bg-brass-bright" />
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-white/70">{site.lawyer}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
