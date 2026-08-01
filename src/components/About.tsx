"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { education, intro } from "@/lib/content";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduced) return;

      // Word-by-word dim-to-bright as the paragraph scrolls through.
      const split = new SplitText(".about-body", { type: "words" });

      gsap.fromTo(
        split.words,
        { opacity: 0.18 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.05,
          scrollTrigger: {
            trigger: ".about-body",
            start: "top 78%",
            end: "bottom 55%",
            scrub: true,
          },
        },
      );

      gsap.from(".about-edu > *", {
        opacity: 0,
        y: 24,
        duration: 0.9,
        stagger: 0.08,
        scrollTrigger: { trigger: ".about-edu", start: "top 85%" },
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="about"
      ref={root}
      className="px-6 py-24 md:px-10 md:py-36"
    >
      <SectionHeading index="01" label="About">
        {intro.lead}
        <br />
        <span className="serif-accent">{intro.leadAccent}</span>
      </SectionHeading>

      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-7 md:col-start-6">
          <div className="about-body space-y-6 text-xl leading-relaxed md:text-2xl">
            {intro.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="about-edu border-line mt-14 border-t pt-8">
            <p className="label mb-5">Education</p>
            <p className="display text-2xl md:text-3xl">{education.degree}</p>
            <p className="text-bone-dim mt-2">
              {education.school} · {education.period} · {education.detail}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {education.coursework.map((course) => (
                <li
                  key={course}
                  className="border-line text-bone-dim rounded-full border px-3 py-1.5 text-xs"
                >
                  {course}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
