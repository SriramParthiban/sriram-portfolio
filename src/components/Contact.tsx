"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { profile } from "@/lib/content";

export default function Contact() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (reduced) return;

      const split = new SplitText(".contact-line", { type: "chars" });

      gsap.from(split.chars, {
        yPercent: 115,
        duration: 1,
        ease: "expo.out",
        stagger: 0.02,
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });

      gsap.from(".contact-anim", {
        opacity: 0,
        y: 22,
        duration: 0.9,
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 60%" },
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <section
      id="contact"
      ref={root}
      className="border-line border-t px-6 py-28 md:px-10 md:py-40"
    >
      <div className="section-meta mb-10 flex items-baseline gap-4">
        <span className="label !text-ember">06</span>
        <span className="label">Contact</span>
      </div>

      <h2 className="display t-mega">
        <span className="split-line-wrap">
          <span className="contact-line block">Let&apos;s</span>
        </span>
        <span className="split-line-wrap">
          <span className="contact-line block">talk</span>
        </span>
      </h2>

      <div className="mt-16 grid gap-10 md:grid-cols-12">
        <div className="contact-anim md:col-span-5">
          <p className="text-bone-dim text-xl leading-relaxed md:text-2xl">
            Got a process that eats hours every week? That&apos;s the kind of
            thing I like to <span className="serif-accent">delete.</span>
          </p>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <a
            href={`mailto:${profile.email}`}
            className="contact-anim link-underline display block text-2xl break-all md:text-4xl"
          >
            {profile.email}
          </a>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div className="contact-anim">
              <p className="label mb-2">Phone</p>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="link-underline text-lg"
              >
                {profile.phone}
              </a>
            </div>
            <div className="contact-anim">
              <p className="label mb-2">Elsewhere</p>
              <div className="flex flex-col gap-1">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline w-fit text-lg"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline w-fit text-lg"
                >
                  GitHub ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
