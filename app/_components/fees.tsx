import type { SiteContent } from "../_lib/content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

export function Fees({ fees }: { fees: SiteContent["fees"] }) {
  return (
    <section id="honoraires" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <SectionHeading title="Honoraires" subtitle={fees.title} />
      <Reveal delay={0.05}>
        <p className="prose-fr mx-auto mt-6 max-w-2xl text-center leading-relaxed text-ink-soft">{fees.lead}</p>
      </Reveal>

      <div
        className="mt-14 grid gap-6"
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 17rem), 1fr))` }}
      >
        {fees.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08} className="h-full">
            <div className="h-full border-t-[3px] border-brass bg-paper-deep p-8 transition-colors duration-300 hover:bg-white hover:shadow-[0_18px_36px_-20px_rgb(18_22_29/0.35)]">
              <span className="display text-[2.4rem] leading-none text-brass/30">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="display mt-3 text-[1.3rem]">{item.title}</h3>
              <p className="prose-fr mt-3 leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
