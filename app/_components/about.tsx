import { about } from "../_lib/content";
import { Eyebrow } from "./button";
import { Reveal, SplitHeading } from "./reveal";

export function About() {
  return (
    <section id="cabinet" className="mx-auto max-w-7xl px-4 py-28 md:px-8 md:py-40">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <Reveal>
              <Eyebrow>{about.eyebrow}</Eyebrow>
            </Reveal>
            <SplitHeading
              text={about.title}
              className="display mt-7 text-[clamp(2.25rem,5vw,4.25rem)]"
            />
          </div>
        </div>

        <div className="md:col-span-7 md:pt-3">
          <div className="space-y-6">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p className="prose-fr text-lg leading-relaxed text-ink-soft">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="my-14 border-l border-brass/50 pl-6 md:pl-8">
            <blockquote className="display text-[clamp(1.6rem,3vw,2.4rem)] italic leading-[1.15]">
              « {about.quote} »
            </blockquote>
          </Reveal>

          <Reveal>
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.5rem] bg-ink/10 ring-1 ring-ink/10 sm:grid-cols-2">
              {about.facts.map((f) => (
                <div key={f.label} className="bg-paper-card px-6 py-5">
                  <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-ink-faint">{f.label}</dt>
                  <dd className="mt-1.5 text-[1.05rem] text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
