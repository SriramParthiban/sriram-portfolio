# sriram-portfolio

Personal portfolio for Sriram Parthiban — AI Automation Engineer.

Two ways in. The landing experience is a **top-down explorable valley** in the
Stardew Valley mould: a character you walk around a map of six buildings, each
one a section of the portfolio. Walk into a door and you're inside that section.
Underneath it is a conventional single-page, scroll-driven site built on GSAP
timelines and ScrollTrigger over Lenis smooth scroll, reachable at any time. No
backend.

All pixel art is drawn procedurally in code. No game assets are copied or
vendored.

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
    game/           the explorable valley
      GameWorld.tsx   loop, input, collision, camera, depth sorting
      world.ts        terrain generation, buildings, collision, warps
      render.ts       tile / tree / building painters and per-place flair
      sprite.ts       the character, drawn from pixel-aligned rects
      LocationPanel.tsx  building interiors, fed from content.ts
    *.tsx           one file per page section
  lib/
    content.ts      all copy and resume data — edit here, not in components
    gsap.ts         single place plugins are registered
    scrollLock.ts   keyed scroll locking shared by preloader and playground
```

## The valley

Controls: `WASD` / arrows to walk, `Shift` to run, walk into a door to enter,
`Esc` to leave a building. Touch devices drag anywhere to steer.

| Building | Section |
| --- | --- |
| The Archive | About & Education |
| The Workshop | Experience |
| The Foundry | Capabilities |
| The Gallery | Projects |
| Trophy Hall | Certifications |
| Post Office | Contact |

### How it works

Borrowed from how Stardew Valley builds a map:

- **16px tiles**, drawn at an integer scale (3× to 5× depending on viewport) so
  pixels stay square.
- **The ground is composed per pixel** into an `ImageData` buffer, not filled as
  rectangles — value noise for grass, grit and stones in the dirt, offset cobble
  courses with mortar joints. Detail at this density is what separates the look
  from flat colour blocks.
- **Organic terrain edges.** Where two terrains meet, the higher-ranked one
  creeps over the boundary by a noise-driven amount, so grass frays into paths
  and sand into water instead of meeting on a straight tile edge.
- **Sprites are pre-rendered once** to offscreen canvases and blitted. Trees,
  buildings and props carry far too much per-pixel detail to repaint each frame.
- **In-world text** uses a hand-built 5×7 bitmap font. `fillText` would
  anti-alias and break the illusion next to a 16px tile.
- **Depth sorting on the bottom edge.** Trees, buildings and the player go into
  one list sorted by their baseline Y, so you walk *behind* a tree canopy but
  *in front of* its trunk. This is the single trick that makes a flat tilemap
  read as having depth.
- **Feet-only collision.** The hitbox is 10×6px at the character's feet, not
  the whole 16×24 sprite, so the head can overlap the tile above.
- **Warp on contact.** Stepping onto a door tile enters — no confirm prompt. It
  fires on the transition onto the tile, not while standing on it.
- **Movement is axis-separated**, so you slide along a wall instead of sticking
  to it.

Every building carries a hanging sign with its name, what's inside, and a
pictogram, so you know where you're going before you walk in.

The valley is a hub and spoke: a round plaza with a fountain at its centre and
six roads leading out, one to each building. Each road is a polyline in
`world.ts`, rasterised with a 2×2 brush. Southern buildings need their road to
wrap around them, because every door faces south — away from the hub.

The character is a hand-authored pixel matrix (16×26, four directions), not a
composition of rectangles. Rectangles cannot describe a hairline, a cheekbone or
an eye, which is why the first attempt read as a mannequin.

Terrain is generated from feature shapes in `world.ts` rather than a hand-typed
tile string — a 48×32 string is 1536 characters that all have to line up, and
one miscount silently shifts the whole map.

### Changing the map

Buildings and props all collide, so moving one can wall off a door. After
editing `world.ts`, re-run the reachability check: flood fill from spawn and
assert every door is still reachable, no footprints overlap, and no prop is
sitting on a road or in the water. Roads are two tiles wide, so a prop that
looks clear of the centre line can still be standing in the road.

The sprite matrices need checking too: every row must be exactly 16 characters
and every character must exist in the palette. A hand-typed matrix picks up
non-ASCII lookalikes — a Cyrillic `о` for an ASCII `o` renders as a hole in the
sprite and raises no error anywhere.

Fountain geometry lives in `fountain.ts`, deliberately free of imports so it can
be loaded and asserted outside the browser. The silhouette must stay wider than
it is tall, widest at the bottom, with each bowl clearly wider than the stem
beneath it. Built as a narrow shaft under a cap, it reads as something other
than a fountain — hence the constraints being checked rather than eyeballed.

The world renders client-side only. That is deliberate: the page's HTML still
contains the full resume text for crawlers and link previews, with the game
layered on top in the browser.

All text lives in `src/lib/content.ts`. Changing a job, project, metric or
certification means editing that file only; the sections render from it.

## Motion notes

- Every animated section checks `prefers-reduced-motion` and falls back to a
  static layout. Lenis is not installed at all when reduced motion is set, and
  the valley is skipped entirely — a visitor-driven camera is exactly what that
  setting is asking us not to do.
- The projects section uses a pinned horizontal scroll above 768px only; below
  that the panels stack and scroll normally.
- GSAP plugins are registered once in `src/lib/gsap.ts`.

## Deploying

Import the repo on Vercel. Framework preset is detected automatically; no
environment variables are needed.
