"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import SectionHeading from "./SectionHeading";
import { capabilities } from "@/lib/content";

export default function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduced) return;

      gsap.from(".cap-row", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        scrollTrigger: { trigger: ".cap-list", start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section
      id="capabilities"
      ref={root}
      className="px-6 py-24 md:px-10 md:py-36"
    >
      <SectionHeading index="02" label="Capabilities">
        What I actually <span className="serif-accent">do</span>
      </SectionHeading>

      <div className="cap-list border-line border-t">
        {capabilities.map((cap, i) => (
          <div
            key={cap.title}
            className="cap-row border-line group border-b py-8 md:py-10"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <div className="grid gap-6 md:grid-cols-12 md:items-start md:gap-10">
              <div className="flex items-baseline gap-4 md:col-span-5">
                <span className="label !text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className={`display text-3xl transition-colors duration-500 md:text-5xl ${
                    active === i ? "text-bone" : "text-muted"
                  }`}
                >
                  {cap.title}
                </h3>
              </div>

              <p className="text-bone-dim md:col-span-4 md:text-lg">
                {cap.blurb}
              </p>

              <ul className="flex flex-wrap gap-2 md:col-span-3 md:justify-end">
                {cap.stack.map((item) => (
                  <li
                    key={item}
                    className="border-line text-bone-dim rounded-full border px-3 py-1.5 text-xs"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
