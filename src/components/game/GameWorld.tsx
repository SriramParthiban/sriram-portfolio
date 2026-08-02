"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lockScroll, scrollToSection, unlockScroll } from "@/lib/scrollLock";
import { profile } from "@/lib/content";
import LocationPanel from "./LocationPanel";
import { drawCharacter, type Dir } from "./sprite";
import {
  buildGroundCanvas,
  drawBuilding,
  drawProp,
  drawTree,
  drawWater,
} from "./render";
import {
  Building,
  LocationId,
  MAP_H,
  MAP_W,
  SPAWN,
  TILE,
  Terrain,
  PROP_SIZE,
  buildings,
  doorAt,
  isSolid,
  props,
  regionAt,
  terrainAt,
} from "./world";

const WALK = 78; // world px per second
const RUN = 126;
const FRAME_TIME = 0.13;

/** Feet-only collision box, so the head can overlap tiles above. */
const FEET_W = 10;
const FEET_H = 6;

const REDUCED = "(prefers-reduced-motion: reduce)";
const neverChanges = () => () => {};
function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

type Runtime = {
  x: number;
  y: number;
  dir: Dir;
  frame: number;
  frameTime: number;
  moving: boolean;
  camX: number;
  camY: number;
  scale: number;
  /** Normalised joystick vector for touch input. */
  joyX: number;
  joyY: number;
  paused: boolean;
};

export default function GameWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const groundRef = useRef<HTMLCanvasElement | null>(null);
  const keys = useRef(new Set<string>());
  const joyOrigin = useRef<{ x: number; y: number; id: number } | null>(null);

  const rt = useRef<Runtime>({
    x: SPAWN.x,
    y: SPAWN.y,
    dir: "down",
    frame: 0,
    frameTime: 0,
    moving: false,
    camX: 0,
    camY: 0,
    scale: 3,
    joyX: 0,
    joyY: 0,
    paused: false,
  });

  const [closed, setClosed] = useState(false);
  const [region, setRegion] = useState("Town Plaza");
  const [nearDoor, setNearDoor] = useState<Building | null>(null);
  const [open, setOpen] = useState<LocationId | null>(null);
  const [visited, setVisited] = useState<Set<LocationId>>(new Set());

  const mounted = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  const active = mounted && !reducedMotion && !closed;

  // The loop reads these without wanting to re-subscribe every frame.
  const openRef = useRef<LocationId | null>(null);
  const nearRef = useRef<Building | null>(null);

  useEffect(() => {
    if (!active) return;
    lockScroll("game");
    document.documentElement.classList.add("playground-open");
    return () => {
      document.documentElement.classList.remove("playground-open");
      unlockScroll("game");
    };
  }, [active]);

  const enterLocation = useCallback((b: Building) => {
    if (openRef.current) return;
    openRef.current = b.id;
    rt.current.paused = true;
    setOpen(b.id);
    setVisited((prev) => new Set(prev).add(b.id));
  }, []);

  const closeLocation = useCallback(() => {
    openRef.current = null;
    rt.current.paused = false;
    setOpen(null);
  }, []);

  /** Leave the game and hand over to the scrolling document. */
  const exitToDocument = useCallback((href?: string) => {
    gsap
      .timeline({ onComplete: () => setClosed(true) })
      .to(".game-wipe", { opacity: 1, duration: 0.35, ease: "power2.inOut" })
      .add(() => {
        document.documentElement.classList.remove("playground-open");
        unlockScroll("game");
        ScrollTrigger.refresh();
        if (href) scrollToSection(href, true);
      })
      .to(rootRef.current, { opacity: 0, duration: 0.5 }, "+=0.1");
  }, []);

  /* ------------------------------------------------------------- keyboard */
  useEffect(() => {
    if (!active) return;

    const map: Record<string, string> = {
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
      shift: "run",
    };

    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape") {
        if (openRef.current) closeLocation();
        return;
      }
      if (k === "enter" || k === "e") {
        if (!openRef.current && nearRef.current) enterLocation(nearRef.current);
        return;
      }
      const mapped = map[k];
      if (!mapped) return;
      // Arrow keys would otherwise scroll the locked page in some browsers.
      if (k.startsWith("arrow")) e.preventDefault();
      keys.current.add(mapped);
    };

    const up = (e: KeyboardEvent) => {
      const mapped = map[e.key.toLowerCase()];
      if (mapped) keys.current.delete(mapped);
    };

    const blur = () => keys.current.clear();

    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [active, enterLocation, closeLocation]);

  /* ------------------------------------------------------------- the loop */
  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    groundRef.current = buildGroundCanvas();
    const ground = groundRef.current;
    const state = rt.current;

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    const resize = () => {
      cssW = window.innerWidth;
      cssH = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Integer scale keeps pixels square; smaller viewports get less zoom so
      // more of the world stays on screen.
      state.scale = cssW < 720 ? 3 : cssW < 1500 ? 4 : 5;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.imageSmoothingEnabled = false;
    };
    resize();
    window.addEventListener("resize", resize);

    let lastRegion = "";
    let lastDoorId: LocationId | null = null;
    let elapsed = 0;

    const blocked = (nx: number, ny: number) => {
      const left = Math.floor((nx - FEET_W / 2) / TILE);
      const right = Math.floor((nx + FEET_W / 2 - 1) / TILE);
      const top = Math.floor((ny - FEET_H) / TILE);
      const bottom = Math.floor((ny - 1) / TILE);
      for (let ty = top; ty <= bottom; ty++) {
        for (let tx = left; tx <= right; tx++) {
          if (isSolid(tx, ty)) return true;
        }
      }
      return false;
    };

    /**
     * Last-resort safety: if the player somehow ends up inside a solid tile —
     * a moved prop, a resize, a rounding edge — walk outward until a free
     * tile is found rather than leaving them wedged with no way out.
     */
    const unstick = () => {
      if (!blocked(state.x, state.y)) return;
      for (let radius = 1; radius <= 8; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
            const nx = state.x + dx * TILE;
            const ny = state.y + dy * TILE;
            if (!blocked(nx, ny)) {
              state.x = nx;
              state.y = ny;
              return;
            }
          }
        }
      }
    };
    unstick();

    const tick = (_t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 50) / 1000;
      elapsed += dt;

      if (blocked(state.x, state.y)) unstick();

      let dx = 0;
      let dy = 0;

      if (!state.paused) {
        if (keys.current.has("left")) dx -= 1;
        if (keys.current.has("right")) dx += 1;
        if (keys.current.has("up")) dy -= 1;
        if (keys.current.has("down")) dy += 1;
        dx += state.joyX;
        dy += state.joyY;
      }

      const len = Math.hypot(dx, dy);
      const running = keys.current.has("run");
      const speed = running ? RUN : WALK;

      if (len > 0.12) {
        dx /= len;
        dy /= len;

        // Axis-separated so the player slides along walls instead of sticking.
        const nx = state.x + dx * speed * dt;
        if (!blocked(nx, state.y)) state.x = nx;
        const ny = state.y + dy * speed * dt;
        if (!blocked(state.x, ny)) state.y = ny;

        // Facing follows the dominant axis, as in Stardew.
        if (Math.abs(dx) > Math.abs(dy)) state.dir = dx > 0 ? "right" : "left";
        else state.dir = dy > 0 ? "down" : "up";

        state.moving = true;
        state.frameTime += dt;
        const step = running ? FRAME_TIME * 0.72 : FRAME_TIME;
        while (state.frameTime > step) {
          state.frameTime -= step;
          state.frame = (state.frame + 1) % 4;
        }
      } else {
        state.moving = false;
        state.frame = 0;
        state.frameTime = 0;
      }

      state.x = gsap.utils.clamp(8, MAP_W * TILE - 8, state.x);
      state.y = gsap.utils.clamp(12, MAP_H * TILE - 4, state.y);

      /* ---- warps and HUD ---- */
      const tx = Math.floor(state.x / TILE);
      const ty = Math.floor(state.y / TILE);

      const door = doorAt(tx, ty);
      const doorId = door?.id ?? null;
      // Fires only on the transition onto a door tile. Warping on every frame
      // the player *occupies* it would re-open the panel the instant they
      // closed it, since they are still standing in the doorway.
      if (doorId !== lastDoorId) {
        lastDoorId = doorId;
        nearRef.current = door;
        setNearDoor(door);
        // Stardew warps on contact — no confirmation prompt.
        if (door && !state.paused && !openRef.current) enterLocation(door);
      }

      const name = regionAt(tx, ty);
      if (name !== lastRegion) {
        lastRegion = name;
        setRegion(name);
      }

      /* ---- camera ---- */
      const viewW = cssW / state.scale;
      const viewH = cssH / state.scale;
      const worldW = MAP_W * TILE;
      const worldH = MAP_H * TILE;
      state.camX =
        worldW <= viewW
          ? (worldW - viewW) / 2
          : gsap.utils.clamp(0, worldW - viewW, state.x - viewW / 2);
      state.camY =
        worldH <= viewH
          ? (worldH - viewH) / 2
          : gsap.utils.clamp(0, worldH - viewH, state.y - viewH / 2);

      /* ---- draw ---- */
      const s = dpr * state.scale;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#1b2a1c";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(s, 0, 0, s, -state.camX * s, -state.camY * s);

      // Ground: blit only the visible slice of the pre-rendered map.
      const sx = Math.max(0, Math.floor(state.camX));
      const sy = Math.max(0, Math.floor(state.camY));
      const sw = Math.min(worldW - sx, Math.ceil(viewW) + 2);
      const sh = Math.min(worldH - sy, Math.ceil(viewH) + 2);
      if (sw > 0 && sh > 0) {
        ctx.drawImage(ground, sx, sy, sw, sh, sx, sy, sw, sh);
      }

      const tx0 = Math.max(0, Math.floor(state.camX / TILE) - 1);
      const ty0 = Math.max(0, Math.floor(state.camY / TILE) - 1);
      const tx1 = Math.min(MAP_W - 1, Math.ceil((state.camX + viewW) / TILE));
      const ty1 = Math.min(MAP_H - 1, Math.ceil((state.camY + viewH) / TILE));

      for (let y = ty0; y <= ty1; y++) {
        for (let x = tx0; x <= tx1; x++) {
          if (terrainAt(x, y) === Terrain.Water) drawWater(ctx, x, y, elapsed);
        }
      }

      // Painter's algorithm on the bottom edge — this is what lets the player
      // walk behind a tree canopy but in front of its trunk.
      type Item = { sort: number; draw: () => void };
      const items: Item[] = [];

      for (let y = ty0; y <= ty1 + 2; y++) {
        for (let x = tx0; x <= tx1; x++) {
          if (y < MAP_H && terrainAt(x, y) === Terrain.Tree) {
            items.push({
              sort: (y + 1) * TILE,
              draw: () => drawTree(ctx, x, y),
            });
          }
        }
      }

      for (const b of buildings) {
        if (
          b.x + b.w < tx0 - 2 ||
          b.x > tx1 + 2 ||
          b.y + b.h < ty0 - 4 ||
          b.y > ty1 + 2
        ) {
          continue;
        }
        items.push({
          sort: (b.y + b.h) * TILE,
          draw: () => drawBuilding(ctx, b, elapsed),
        });
      }

      for (const p of props) {
        if (
          p.x < tx0 - 3 ||
          p.x > tx1 + 3 ||
          p.y < ty0 - 4 ||
          p.y > ty1 + 3
        ) {
          continue;
        }
        items.push({
          sort: (p.y + PROP_SIZE[p.kind].h) * TILE,
          draw: () => drawProp(ctx, p.kind, p.x, p.y, elapsed),
        });
      }

      items.push({
        sort: state.y,
        draw: () =>
          drawCharacter(
            ctx,
            state.x,
            state.y,
            state.dir,
            state.frame,
            state.moving,
            elapsed,
          ),
      });

      items.sort((a, b) => a.sort - b.sort);
      for (const item of items) item.draw();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    gsap.ticker.add(tick);
    gsap.from(rootRef.current, { opacity: 0, duration: 0.9, delay: 2.4 });

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", resize);
    };
  }, [active, enterLocation]);

  /* --------------------------------------------------------- touch stick */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "touch" || rt.current.paused) return;
    joyOrigin.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const origin = joyOrigin.current;
    if (!origin || origin.id !== e.pointerId) return;
    const dx = e.clientX - origin.x;
    const dy = e.clientY - origin.y;
    const dist = Math.hypot(dx, dy);
    const max = 56;
    if (dist < 8) {
      rt.current.joyX = 0;
      rt.current.joyY = 0;
      return;
    }
    const k = Math.min(dist, max) / max / (dist || 1);
    rt.current.joyX = dx * k;
    rt.current.joyY = dy * k;
  };

  const endPointer = (e: React.PointerEvent) => {
    if (joyOrigin.current?.id !== e.pointerId) return;
    joyOrigin.current = null;
    rt.current.joyX = 0;
    rt.current.joyY = 0;
  };

  if (!active) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-60 overflow-hidden bg-[#1b2a1c]">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        className="block h-full w-full touch-none [image-rendering:pixelated]"
      />

      {/* ---- HUD ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-6">
        <div className="border-line rounded-md border bg-black/55 px-4 py-3 backdrop-blur-sm">
          <p className="display text-lg leading-none md:text-xl">
            {profile.first}
            <span className="text-ember">.</span>
            {profile.last}
          </p>
          <p className="label mt-2 !text-[10px]">{region}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => exitToDocument("#top")}
            className="label link-underline pointer-events-auto rounded-md bg-black/55 px-3 py-2 !text-bone backdrop-blur-sm"
          >
            Read as a document ↓
          </button>
          <p className="label !text-[10px] rounded-md bg-black/40 px-3 py-2">
            {visited.size} / {buildings.length} places visited
          </p>
        </div>
      </div>

      {/* Door prompt */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-6">
        {nearDoor && !open && (
          <p className="border-ember bg-ink/85 rounded-md border px-4 py-2 text-sm backdrop-blur-sm">
            Entering <span className="text-ember">{nearDoor.name}</span>
          </p>
        )}
        <p className="label border-line hidden rounded-md border bg-black/65 px-4 py-2 text-center !text-[10px] backdrop-blur-sm md:block">
          WASD / arrows to walk · shift to run · walk into a door to enter · esc
          to leave a building
        </p>
        <p className="label border-line rounded-md border bg-black/65 px-4 py-2 text-center !text-[10px] backdrop-blur-sm md:hidden">
          Drag anywhere to walk
        </p>
      </div>

      {open && (
        <LocationPanel
          id={open}
          onClose={closeLocation}
          onOpenFull={exitToDocument}
        />
      )}

      <div className="game-wipe bg-ember pointer-events-none absolute inset-0 z-20 opacity-0" />
    </div>
  );
}
