# sriram-portfolio

Personal portfolio for Sriram Parthiban — AI Automation Engineer.

Two ways in. The landing experience is an interactive **playground**: a
side-scrolling world with a character the visitor walks along a corridor of lit
doorways, one per section. Walking into a doorway drops you into that section of
the site proper — a single-page, scroll-driven layout built on GSAP timelines
and ScrollTrigger over Lenis smooth scroll. No backend.

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
  components/
    playground/     the interactive landing world
      Playground.tsx  world, camera, character controller, door entry
      Character.tsx   character SVG (transforms driven from Playground)
      stations.ts     door positions and section mapping
    *.tsx           one file per page section
  lib/
    content.ts      all copy and resume data — edit here, not in components
    gsap.ts         single place plugins are registered
    scrollLock.ts   keyed scroll locking shared by preloader and playground
```

## Playground

Controls: `←` `→` or `A` / `D` to walk, click anywhere to walk there, click a
doorway to walk to it and enter, `E` / `Enter` to enter the nearest doorway,
`Esc` or "Skip intro" to go straight to the site. Touch devices get on-screen
walk buttons; tapping a doorway also works.

Doors are placed at `stationX(i)` in `stations.ts` and mapped to section
anchors, so adding a section means adding one entry there.

It renders client-side only. That is deliberate: the page's HTML still contains
the full resume text for crawlers and link previews, with the world layered on
top in the browser.

All text lives in `src/lib/content.ts`. Changing a job, project, metric or
certification means editing that file only; the sections render from it.

## Motion notes

- Every animated section checks `prefers-reduced-motion` and falls back to a
  static layout. Lenis is not installed at all when reduced motion is set, and
  the playground is skipped entirely — a visitor-driven camera is exactly what
  that setting is asking us not to do.
- The projects section uses a pinned horizontal scroll above 768px only; below
  that the panels stack and scroll normally.
- GSAP plugins are registered once in `src/lib/gsap.ts`.

## Deploying

Import the repo on Vercel. Framework preset is detected automatically; no
environment variables are needed.
