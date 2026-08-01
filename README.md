# sriram-portfolio

A portfolio built as an explorable world rather than a page. Visitors move an
avatar through a space and enter rooms, where each room is a section of the
portfolio.

Work in progress — the world itself isn't built yet. What's here is the
foundation plus a temporary smoke-test scene that proves the rendering,
physics and animation layers work together.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| 3D | Three.js via React Three Fiber + drei |
| Physics | Rapier (`@react-three/rapier`) |
| Animation | GSAP + ScrollTrigger |
| State | Zustand |
| Hosting | Vercel |

No backend.

## Running locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # production build
npm run lint    # eslint
```

## Layout

```
src/
  app/          routes, layout, global styles
  components/   React + R3F components
public/         static assets and 3D models
```

`src/components/SmokeTestScene.tsx` is a throwaway stack check and will be
deleted once the real world lands.
