"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { metrics } from "@/lib/content";

export default function Metrics() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      const cards = gsap.utils.toArray<HTMLElement>(".metric-card");

      cards.forEach((card, i) => {
        const numberEl = card.querySelector<HTMLElement>(".metric-value");
        const target = metrics[i].value;

        if (reduced) {
          if (numberEl) numberEl.textContent = String(target);
          return;
        }

        gsap.from(card, {
          opacity: 0,
          y: 40,
          duration: 1,
          scrollTrigger: { trigger: card, start: "top 88%" },
        });

        const counter = { n: 0 };
        gsap.to(counter, {
          n: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 85%" },
          onUpdate: () => {
            if (numberEl) numberEl.textContent = String(Math.round(counter.n));
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-line border-t px-6 md:px-10">
      <div className="grid md:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="metric-card border-line border-b py-10 md:border-r md:border-b-0 md:px-8 md:py-16 md:first:pl-0 md:last:border-r-0"
          >
            <p className="display text-bone flex items-start text-6xl md:text-7xl">
              <span className="metric-value tabular-nums">0</span>
              <span className="text-ember text-3xl md:text-4xl">
                {metric.suffix}
              </span>
            </p>
            <p className="mt-5 text-base font-medium">{metric.label}</p>
            <p className="text-muted mt-1 text-sm">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
