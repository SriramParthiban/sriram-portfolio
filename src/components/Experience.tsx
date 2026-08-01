"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { experience } from "@/lib/content";

export default function Experience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduced) return;

      gsap.utils.toArray<HTMLElement>(".role").forEach((role) => {
        gsap.from(role.querySelectorAll(".role-anim"), {
          opacity: 0,
          y: 28,
          duration: 0.9,
          stagger: 0.06,
          scrollTrigger: { trigger: role, start: "top 80%" },
        });

        // The rule draws itself down the side of each role.
        gsap.from(role.querySelector(".role-rule"), {
          scaleY: 0,
          transformOrigin: "top",
          ease: "none",
          scrollTrigger: {
            trigger: role,
            start: "top 75%",
            end: "bottom 75%",
            scrub: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} className="px-6 py-24 md:px-10 md:py-36">
      <SectionHeading index="03" label="Experience">
        Where I&apos;ve <span className="serif-accent">shipped</span>
      </SectionHeading>

      <div className="space-y-16 md:space-y-24">
        {experience.map((role) => (
          <article key={role.company} className="role relative">
            <div className="grid gap-8 md:grid-cols-12 md:gap-10">
              <div className="md:col-span-4">
                <div className="md:sticky md:top-28">
                  <div className="role-anim flex items-center gap-3">
                    <h3 className="display text-3xl md:text-4xl">
                      {role.company}
                    </h3>
                    {role.current && (
                      <span className="bg-ember/15 text-ember rounded-full px-2.5 py-1 text-[10px] tracking-widest uppercase">
                        Now
                      </span>
                    )}
                  </div>
                  <p className="role-anim text-bone mt-3 text-lg">
                    {role.title}
                  </p>
                  <p className="role-anim label mt-3">{role.period}</p>
                  <p className="role-anim label !text-muted mt-1">
                    {role.place}
                  </p>
                </div>
              </div>

              <div className="relative md:col-span-8">
                <span className="bg-line role-rule absolute top-0 -left-6 hidden h-full w-px md:block" />
                <ul className="space-y-6">
                  {role.points.map((point) => (
                    <li
                      key={point}
                      className="role-anim text-bone-dim text-lg leading-relaxed md:text-xl"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
