import { fees } from "../_lib/content";
import { Eyebrow } from "./button";
import { Reveal, SplitHeading } from "./reveal";

export function Fees() {
  return (
    <section id="honoraires" className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-40">
      <div className="grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Reveal>
            <Eyebrow>{fees.eyebrow}</Eyebrow>
          </Reveal>
          <SplitHeading
            text={fees.title}
            className="display mt-7 text-[clamp(2.25rem,5vw,4.25rem)]"
          />
          <Reveal delay={0.1}>
            <p className="prose-fr mt-8 max-w-md text-lg leading-relaxed text-ink-soft">{fees.lead}</p>
          </Reveal>
        </div>

        <div className="space-y-5 md:col-span-6 md:col-start-7">
          {fees.items.map((item, i) => (
            // Léger décalage horizontal en cascade (écrans larges seulement).
            <Reveal key={item.title} delay={i * 0.07}>
              <div
                className={`rounded-[2rem] bg-ink/[0.045] p-1.5 ring-1 ring-ink/10 ${i === 1 ? "md:translate-x-8" : i === 2 ? "md:translate-x-3" : ""}`}
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-paper-card p-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] md:p-9">
                  <h3 className="display text-[clamp(1.5rem,2.4vw,2rem)]">{item.title}</h3>
                  <p className="prose-fr mt-3 leading-relaxed text-ink-soft">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
