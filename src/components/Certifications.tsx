"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { certifications } from "@/lib/content";

export default function Certifications() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduced) return;

      gsap.from(".cert-row", {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.05,
        scrollTrigger: { trigger: ".cert-list", start: "top 85%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="px-6 py-24 md:px-10 md:py-36">
      <SectionHeading index="05" label="Certifications">
        Formally <span className="serif-accent">verified</span>
      </SectionHeading>

      <ul className="cert-list border-line border-t">
        {certifications.map((cert) => (
          <li
            key={cert.name}
            className="cert-row border-line group flex items-baseline justify-between gap-6 border-b py-5"
          >
            <span className="text-lg transition-transform duration-500 group-hover:translate-x-2 md:text-2xl">
              {cert.name}
            </span>
            <span className="label shrink-0 text-right">{cert.issuer}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
