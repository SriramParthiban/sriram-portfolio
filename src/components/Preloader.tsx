"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { profile } from "@/lib/content";

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      if (reduced) {
        setDone(true);
        unlockScroll();
        return;
      }

      // A reload can restore mid-page scroll behind the overlay.
      window.scrollTo(0, 0);
      lockScroll();
      const count = { n: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          unlockScroll();
          setDone(true);
        },
      });

      tl.to(count, {
        n: 100,
        duration: 1.9,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter.current) {
            counter.current.textContent = String(Math.round(count.n)).padStart(
              3,
              "0",
            );
          }
        },
      })
        .to(".preloader-name", { opacity: 1, duration: 0.6 }, 0.2)
        .to(".preloader-bar", { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0)
        .to(".preloader-content", { opacity: 0, duration: 0.4 }, "+=0.15")
        .to(root.current, {
          yPercent: -100,
          duration: 1,
          ease: "expo.inOut",
        });

      return () => unlockScroll();
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      className="bg-ink fixed inset-0 z-100 flex items-end justify-between p-6 md:p-10"
      aria-hidden="true"
    >
      <div className="preloader-content flex w-full items-end justify-between">
        <span className="preloader-name label opacity-0">
          {profile.name} — {profile.role}
        </span>
        <span
          ref={counter}
          className="display text-bone text-[18vw] leading-none md:text-[12vw]"
        >
          000
        </span>
      </div>
      <div className="bg-line absolute inset-x-0 bottom-0 h-px">
        <div className="preloader-bar bg-ember h-px origin-left scale-x-0" />
      </div>
    </div>
  );
}
