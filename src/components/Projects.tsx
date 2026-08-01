"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { projects } from "@/lib/content";

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop only: pin the section and drive the track sideways. On small
      // screens the panels just stack and scroll normally, which is both
      // faster and far less fragile on touch.
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = track.current;
          if (!el) return;

          const distance = () => el.scrollWidth - window.innerWidth;

          const tween = gsap.to(el, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          return () => tween.kill();
        },
      );

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".project-card");
        const tweens = cards.map((card) =>
          gsap.from(card.querySelectorAll(".project-anim"), {
            opacity: 0,
            y: 26,
            duration: 0.8,
            stagger: 0.07,
            scrollTrigger: { trigger: card, start: "top 85%" },
          }),
        );
        return () => tweens.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="projects"
      ref={root}
      className="border-line overflow-hidden border-y md:h-dvh"
    >
      <div
        ref={track}
        className="flex flex-col md:h-full md:w-max md:flex-row md:items-stretch"
      >
        {/* Intro panel doubles as the section heading on desktop. */}
        <div className="border-line flex shrink-0 flex-col justify-center border-b px-6 py-24 md:w-[46vw] md:border-r md:border-b-0 md:px-10 md:py-0">
          <div className="flex items-baseline gap-4">
            <span className="label !text-ember">04</span>
            <span className="label">Selected Projects</span>
          </div>
          <h2 className="display t-xl mt-8">
            Things I<span className="serif-accent"> built</span>
          </h2>
          <p className="text-bone-dim mt-8 max-w-sm text-lg">
            Three systems that took real operational load off real teams. Scroll
            sideways.
          </p>
          <span className="label mt-10 hidden md:block">
            → Drag / scroll to advance
          </span>
        </div>

        {projects.map((project) => (
          <article
            key={project.index}
            className="project-card border-line flex shrink-0 flex-col justify-center border-b px-6 py-20 last:border-b-0 md:w-[62vw] md:border-r md:border-b-0 md:px-14 md:py-0 md:last:border-r-0"
          >
            <span className="project-anim display text-ember text-7xl md:text-8xl">
              {project.index}
            </span>

            <h3 className="project-anim display t-lg mt-6 max-w-2xl">
              {project.title}
            </h3>

            <p className="project-anim text-bone-dim mt-6 max-w-xl text-lg leading-relaxed md:text-xl">
              {project.summary}
            </p>

            <dl className="project-anim border-line mt-10 flex flex-wrap gap-x-12 gap-y-6 border-t pt-8">
              {project.results.map((result) => (
                <div key={result.label}>
                  <dt className="display text-bone text-3xl md:text-4xl">
                    {result.value}
                  </dt>
                  <dd className="text-muted mt-1 text-xs tracking-wide uppercase">
                    {result.label}
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="project-anim mt-8 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li
                  key={item}
                  className="border-line text-bone-dim rounded-full border px-3 py-1.5 text-xs"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
