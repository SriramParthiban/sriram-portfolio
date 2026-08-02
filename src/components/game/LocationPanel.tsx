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
    <li className="border-line text-bone-dim rounded-full border px-3 py-1.5 text-xs">
      {children}
    </li>
  );
}

function Body({ id }: { id: LocationId }) {
  switch (id) {
    case "archive":
      return (
        <div className="space-y-6">
          {intro.body.map((p) => (
            <p key={p} className="text-bone-dim text-lg leading-relaxed">
              {p}
            </p>
          ))}
          <div className="border-line border-t pt-6">
            <p className="label mb-3">Education</p>
            <p className="display text-xl">{education.degree}</p>
            <p className="text-bone-dim mt-2 text-sm">
              {education.school} · {education.period} · {education.detail}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {education.coursework.map((c) => (
                <Pill key={c}>{c}</Pill>
              ))}
            </ul>
          </div>
        </div>
      );

    case "workshop":
      return (
        <div className="space-y-10">
          {experience.map((role) => (
            <div key={role.company}>
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="display text-2xl">{role.company}</h3>
                {role.current && (
                  <span className="bg-ember/15 text-ember rounded-full px-2.5 py-1 text-[10px] tracking-widest uppercase">
                    Now
                  </span>
                )}
              </div>
              <p className="text-bone mt-1">{role.title}</p>
              <p className="label mt-1">
                {role.period} · {role.place}
              </p>
              <ul className="mt-4 space-y-3">
                {role.points.map((point) => (
                  <li
                    key={point}
                    className="text-bone-dim border-line border-l pl-4 text-[15px] leading-relaxed"
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
        <div className="space-y-8">
          {capabilities.map((cap, i) => (
            <div key={cap.title} className="border-line border-t pt-5">
              <div className="flex items-baseline gap-3">
                <span className="label !text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display text-xl">{cap.title}</h3>
              </div>
              <p className="text-bone-dim mt-2 text-[15px]">{cap.blurb}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
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
        <div className="space-y-10">
          {projects.map((project) => (
            <article key={project.index} className="border-line border-t pt-6">
              <span className="display text-ember text-4xl">
                {project.index}
              </span>
              <h3 className="display mt-2 text-2xl">{project.title}</h3>
              <p className="text-bone-dim mt-3 leading-relaxed">
                {project.summary}
              </p>
              <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
                {project.results.map((r) => (
                  <div key={r.label}>
                    <dt className="display text-bone text-2xl">{r.value}</dt>
                    <dd className="text-muted mt-0.5 text-[10px] tracking-wide uppercase">
                      {r.label}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-5 flex flex-wrap gap-2">
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
        <ul className="border-line border-t">
          {certifications.map((cert) => (
            <li
              key={cert.name}
              className="border-line flex items-baseline justify-between gap-6 border-b py-4"
            >
              <span className="text-[15px]">{cert.name}</span>
              <span className="label shrink-0 text-right !text-[10px]">
                {cert.issuer}
              </span>
            </li>
          ))}
        </ul>
      );

    case "post":
      return (
        <div className="space-y-8">
          <p className="text-bone-dim text-lg leading-relaxed">
            Got a process that eats hours every week? That&apos;s the kind of
            thing I like to <span className="serif-accent">delete.</span>
          </p>
          <div className="border-line space-y-5 border-t pt-6">
            <div>
              <p className="label mb-1">Email</p>
              <a
                href={`mailto:${profile.email}`}
                className="link-underline display text-xl break-all"
              >
                {profile.email}
              </a>
            </div>
            <div>
              <p className="label mb-1">Phone</p>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="link-underline"
              >
                {profile.phone}
              </a>
            </div>
            <div className="flex gap-6">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                LinkedIn ↗
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                GitHub ↗
              </a>
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
      <button
        type="button"
        aria-label="Leave building"
        onClick={onClose}
        className="panel-scrim absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />

      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-label={building.name}
        className="panel-card border-ember bg-ink absolute inset-x-3 top-[6%] bottom-[6%] mx-auto flex max-w-3xl flex-col rounded-lg border-2 outline-none"
      >
        {/* Header */}
        <div className="border-line flex items-start justify-between gap-4 border-b px-6 py-5 md:px-8">
          <div>
            <p className="label !text-ember">{building.sub}</p>
            <h2 className="display mt-1 text-3xl md:text-4xl">
              {building.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="label border-line hover:border-ember shrink-0 rounded-md border px-3 py-2 transition-colors"
          >
            Leave · esc
          </button>
        </div>

        {/* Scrollable interior */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
          <p className="text-muted mb-8 text-sm italic">{FLAVOUR[id]}</p>
          <Body id={id} />
        </div>

        <div className="border-line border-t px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={() => onOpenFull(HREF[id])}
            className="label link-underline !text-bone"
          >
            Open this as a full page ↓
          </button>
        </div>
      </div>
    </div>
  );
}
