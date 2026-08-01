# sriram-portfolio

Personal portfolio for Sriram Parthiban — AI Automation Engineer.

A single-page, scroll-driven site: GSAP timelines and ScrollTrigger over Lenis
smooth scroll, with a dark editorial layout built around large type. No backend.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | GSAP 3 — ScrollTrigger, SplitText, `@gsap/react` |
| Smooth scroll | Lenis |
| Fonts | Archivo, Instrument Serif, Geist Mono (`next/font`) |
| Hosting | Vercel |

## Running locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
```

## Layout

```
src/
  app/
    layout.tsx      fonts, metadata, preloader + smooth scroll providers
    page.tsx        section composition
    globals.css     design tokens, type scale, grain, marquee
  components/       one file per section
  lib/
    content.ts      all copy and resume data — edit here, not in components
    gsap.ts         single place plugins are registered
    scrollLock.ts   preloader/Lenis scroll locking
```

All text lives in `src/lib/content.ts`. Changing a job, project, metric or
certification means editing that file only; the sections render from it.

## Motion notes

- Every animated section checks `prefers-reduced-motion` and falls back to a
  static layout. Lenis is not installed at all when reduced motion is set.
- The projects section uses a pinned horizontal scroll above 768px only; below
  that the panels stack and scroll normally.
- GSAP plugins are registered once in `src/lib/gsap.ts`.

## Deploying

Import the repo on Vercel. Framework preset is detected automatically; no
environment variables are needed.
