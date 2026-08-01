"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { profile } from "@/lib/content";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      if (reduced) {
        gsap.set(".hero-reveal, .hero-meta, .hero-scroll", {
          opacity: 1,
          yPercent: 0,
        });
        return;
      }

      const split = new SplitText(".hero-line", {
        type: "chars",
        charsClass: "hero-char",
      });

      const tl = gsap.timeline({
        // Start after the preloader has cleared the viewport.
        delay: 2.6,
      });

      tl.from(split.chars, {
        yPercent: 118,
        duration: 1.15,
        ease: "expo.out",
        stagger: { each: 0.022, from: "start" },
      })
        .to(".hero-meta", { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, "-=0.7")
        .to(".hero-scroll", { opacity: 1, duration: 0.6 }, "-=0.5");

      // Parallax drift as the hero leaves.
      gsap.to(".hero-inner", {
        yPercent: -18,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-dvh flex-col justify-between px-6 pt-32 pb-8 md:px-10 md:pb-10"
    >
      <div className="hero-inner flex flex-1 flex-col justify-center">
        <p className="hero-meta translate-y-4 opacity-0">
          <span className="label">Portfolio — 2026</span>
        </p>

        <h1 className="display t-mega mt-6">
          <span className="split-line-wrap">
            <span className="hero-line block">Sriram</span>
          </span>
          <span className="split-line-wrap">
            <span className="hero-line block">Parthiban</span>
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-6 md:mt-14 md:flex-row md:items-end md:justify-between">
          <p className="hero-meta text-bone-dim max-w-md translate-y-4 text-lg leading-snug opacity-0 md:text-xl">
            {profile.role} turning manual process into{" "}
            <span className="serif-accent">systems that run themselves.</span>
          </p>

          <div className="hero-meta flex translate-y-4 flex-col gap-2 opacity-0 md:items-end">
            <span className="label">Based in</span>
            <span className="text-bone text-sm">{profile.location}</span>
            {profile.available && (
              <span className="mt-2 flex items-center gap-2 text-sm">
                <span className="bg-ember relative flex h-1.5 w-1.5 rounded-full">
                  <span className="bg-ember absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" />
                </span>
                Available for work
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="hero-scroll border-line flex items-center justify-between border-t pt-5 opacity-0">
        <span className="label">Scroll to explore</span>
        <span className="label">01 — 06</span>
      </div>
    </section>
  );
}
