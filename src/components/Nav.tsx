"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { navLinks, profile } from "@/lib/content";

export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(
    () => {
      gsap.set(root.current, { yPercent: 0 });

      // Hide on scroll down, reveal on scroll up.
      const showHide = ScrollTrigger.create({
        start: "top -120",
        end: "max",
        onUpdate: (self) => {
          gsap.to(root.current, {
            yPercent: self.direction === 1 ? -110 : 0,
            duration: 0.45,
            ease: "power2.out",
          });
        },
        onLeaveBack: () => gsap.to(root.current, { yPercent: 0, duration: 0.3 }),
      });

      return () => showHide.kill();
    },
    { scope: root },
  );

  return (
    <header
      ref={root}
      className="fixed inset-x-0 top-0 z-50 mix-blend-difference"
    >
      <nav className="flex items-center justify-between px-6 py-5 md:px-10">
        <a href="#top" className="label !text-bone !tracking-[0.18em]">
          {profile.first}
          <span className="text-ember">.</span>
          {profile.last}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="label !text-bone link-underline">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="label !text-bone md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      {open && (
        <ul
          id="mobile-nav"
          className="bg-ink border-line flex flex-col gap-1 border-t px-6 pb-6 md:hidden"
        >
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="display block py-3 text-3xl"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
