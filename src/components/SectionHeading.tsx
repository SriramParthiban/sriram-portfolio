"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export default function SectionHeading({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduced) return;

      const split = new SplitText(".section-title", { type: "lines" });
      split.lines.forEach((line) => {
        const wrap = document.createElement("span");
        wrap.className = "split-line-wrap";
        line.parentNode?.insertBefore(wrap, line);
        wrap.appendChild(line);
      });

      gsap.from(split.lines, {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: root.current,
          start: "top 82%",
        },
      });

      gsap.from(".section-meta", {
        opacity: 0,
        y: 16,
        duration: 0.8,
        scrollTrigger: { trigger: root.current, start: "top 82%" },
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mb-14 md:mb-20">
      <div className="section-meta border-line mb-8 flex items-baseline gap-4 border-t pt-4">
        <span className="label !text-ember">{index}</span>
        <span className="label">{label}</span>
      </div>
      <h2 className="section-title display t-xl">{children}</h2>
    </div>
  );
}
