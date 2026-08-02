"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  capabilities,
  certifications,
  education,
  experience,
  intro,
  profile,
  projects,
} from "@/lib/content";
import { LocationId, buildings } from "./world";

const HREF: Record<LocationId, string> = {
  archive: "#about",
  workshop: "#work",
  foundry: "#capabilities",
  gallery: "#projects",
  trophy: "#certifications",
  post: "#contact",
};

/** A line of flavour text, so each interior reads as its own room. */
const FLAVOUR: Record<LocationId, string> = {
  archive:
    "Shelves of notebooks, a desk lamp still on. This is where the thinking got written down.",
  workshop:
    "Benches, cable trays, a wall of running jobs. Everything here is in production somewhere.",
  foundry: "The forge is lit. Tools on the rack, each one sharpened for a job.",
  gallery: "Three pieces on the wall, each with the numbers it earned.",
  trophy: "A quiet room of plaques. Proof that the paperwork was done.",
  post: "A counter, a pen on a chain, and a mailbox with the flag up.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <li className="paper-tag px-2.5 py-1 text-[11px] tracking-wide">
      {children}
    </li>
  );
}

/** Heading rule, so sections read as pages in a ledger. */
function Rule() {
  return <hr className="paper-rule my-0 border-t" />;
}

function Body({ id }: { id: LocationId }) {
  switch (id) {
    case "archive":
      return (
        <div className="space-y-5">
          {intro.body.map((p) => (
            <p key={p} className="text-[15px] leading-relaxed text-[#5a442c]">
              {p}
            </p>
          ))}
          <Rule />
          <div>
            <p className="paper-label">Education</p>
            <p className="display mt-2 text-xl">{education.degree}</p>
            <p className="mt-1 text-sm text-[#7d6a4e]">
              {education.school} · {education.period} · {education.detail}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {education.coursework.map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </ul>
          </div>
        </div>
      );

    case "workshop":
      return (
        <div className="space-y-8">
          {experience.map((role) => (
            <div key={role.company}>
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="display text-2xl">{role.company}</h3>
                {role.current && (
                  <span className="bg-[#b04a28] px-2 py-1 text-[9px] font-bold tracking-widest text-[#f6ead2] uppercase">
                    Now
                  </span>
                )}
              </div>
              <p className="mt-1 font-medium text-[#5a442c]">{role.title}</p>
              <p className="paper-label mt-1">
                {role.period} · {role.place}
              </p>
              <ul className="mt-3 space-y-2.5">
                {role.points.map((point) => (
                  <li
                    key={point}
                    className="border-l-2 border-[#c9ab7d] pl-3 text-[14px] leading-relaxed text-[#5a442c]"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "foundry":
      return (
        <div className="space-y-6">
          {capabilities.map((cap, i) => (
            <div key={cap.title}>
              {i > 0 && <Rule />}
              <div className={`flex items-baseline gap-3 ${i > 0 ? "pt-5" : ""}`}>
                <span className="paper-label !text-[#b04a28]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display text-xl">{cap.title}</h3>
              </div>
              <p className="mt-1.5 text-[14px] text-[#5a442c]">{cap.blurb}</p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {cap.stack.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-8">
          {projects.map((project, i) => (
            <article key={project.index}>
              {i > 0 && <Rule />}
              <span
                className={`display block text-4xl text-[#b04a28] ${i > 0 ? "pt-6" : ""}`}
              >
                {project.index}
              </span>
              <h3 className="display mt-1 text-2xl">{project.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#5a442c]">
                {project.summary}
              </p>
              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 bg-[#e6d3ae] px-4 py-3">
                {project.results.map((r) => (
                  <div key={r.label}>
                    <dt className="display text-2xl text-[#2f2013]">
                      {r.value}
                    </dt>
                    <dd className="mt-0.5 text-[9px] tracking-wider text-[#7d6a4e] uppercase">
                      {r.label}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <Pill key={s}>{s}</Pill>
                ))}
              </ul>
            </article>
          ))}
        </div>
      );

    case "trophy":
      return (
        <ul>
          {certifications.map((cert, i) => (
            <li
              key={cert.name}
              className={`flex items-baseline justify-between gap-6 py-3 ${
                i % 2 === 0 ? "bg-[#e9d8b6]" : ""
              } px-3`}
            >
              <span className="text-[14px] text-[#4a3520]">{cert.name}</span>
              <span className="paper-label shrink-0 text-right">
                {cert.issuer}
              </span>
            </li>
          ))}
        </ul>
      );

    case "post":
      return (
        <div className="space-y-5">
          <p className="text-[15px] leading-relaxed text-[#5a442c]">
            Got a process that eats hours every week? That&apos;s the kind of
            thing I like to <span className="font-bold text-[#b04a28]">delete.</span>
          </p>
          <Rule />
          <div className="space-y-4 pt-1">
            <div>
              <p className="paper-label mb-1">Email</p>
              <a
                href={`mailto:${profile.email}`}
                className="display text-lg break-all text-[#b04a28] underline decoration-[#c9ab7d] underline-offset-4 hover:decoration-[#b04a28]"
              >
                {profile.email}
              </a>
            </div>
            <div>
              <p className="paper-label mb-1">Phone</p>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="text-[#5a442c] underline decoration-[#c9ab7d] underline-offset-4"
              >
                {profile.phone}
              </a>
            </div>
            <div className="flex gap-5">
              {[
                { label: "LinkedIn ↗", href: profile.linkedin },
                { label: "GitHub ↗", href: profile.github },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-tag px-3 py-1.5 text-[12px] hover:bg-white/70"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      );
  }
}

export default function LocationPanel({
  id,
  onClose,
  onOpenFull,
}: {
  id: LocationId;
  onClose: () => void;
  onOpenFull: (href: string) => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const building = buildings.find((b) => b.id === id);

  useGSAP(
    () => {
      gsap
        .timeline()
        .from(".panel-scrim", { opacity: 0, duration: 0.25 })
        .from(
          ".panel-card",
          { yPercent: 4, opacity: 0, duration: 0.4, ease: "power3.out" },
          0.05,
        );
    },
    { scope: root },
  );

  // Focus the panel so Escape and scrolling land here, not on the canvas.
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  if (!building) return null;

  return (
    <div ref={root} className="absolute inset-0 z-30">
      {/* Warm scrim — pure black over a sunlit world reads as a browser modal. */}
      <button
        type="button"
        aria-label="Leave building"
        onClick={onClose}
        className="panel-scrim absolute inset-0 bg-[#170f08]/70"
      />

      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-label={building.name}
        className="panel-card game-frame absolute inset-x-3 top-[5%] bottom-[5%] mx-auto flex max-w-3xl flex-col p-2 outline-none md:p-2.5"
      >
        {/* Header. The roof colour is a stripe, not a text background: those
            six colours run from dark teal to light gold, and no single text
            colour clears 4.5:1 on all of them. Text sits on dark wood, and the
            label is the roof colour lightened toward cream so the building
            stays identifiable while staying legible. */}
        <div style={{ boxShadow: "0 0 0 2px #2a1c11" }}>
          <div className="h-1.5" style={{ background: building.roof }} />
          <div className="flex items-start justify-between gap-4 bg-[#2e1f12] px-4 py-3 md:px-5">
            <div>
              <p
                className="hud-text text-[9px] font-bold"
                style={{
                  color: `color-mix(in srgb, ${building.roof} 45%, #f6ead2)`,
                }}
              >
                {building.signSub}
              </p>
              <h2 className="display mt-1 text-2xl text-[#fdf3e0] md:text-3xl">
                {building.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hud-panel hud-button hud-text shrink-0 px-3 py-2 text-[9px] font-bold"
            >
              Leave · esc
            </button>
          </div>
        </div>

        {/* Parchment page */}
        <div className="game-paper game-scroll mt-2 min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          <p className="mb-6 border-l-2 border-[#c9ab7d] pl-3 text-[13px] text-[#7d6a4e] italic">
            {FLAVOUR[id]}
          </p>
          <Body id={id} />
        </div>

        {/* Wooden footer rail */}
        <div className="mt-2 flex items-center justify-between gap-3 px-1 pb-0.5">
          <button
            type="button"
            onClick={() => onOpenFull(HREF[id])}
            className="hud-text text-[9px] font-bold text-[#f2dcb8] underline decoration-[#a8834f] underline-offset-4 hover:text-white"
          >
            Open as a full page ↓
          </button>
          <span className="hud-text text-[9px] text-[#c2a97e]">
            {building.sub}
          </span>
        </div>
      </div>
    </div>
  );
}
