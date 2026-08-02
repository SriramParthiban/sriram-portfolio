"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lockScroll, scrollToSection, unlockScroll } from "@/lib/scrollLock";
import { profile } from "@/lib/content";
import Character from "./Character";
import { WORLD, stationX, stations, worldWidth } from "./stations";

/** Height of the floor above the bottom of the viewport. */
const GROUND = "21%";

// Deterministic decor — Math.random() here would desync server and client.
const farShapes = Array.from({ length: 30 }, (_, i) => ({
  x: i * 190 + ((i * 61) % 70),
  w: 30 + ((i * 13) % 5) * 12,
  h: 70 + ((i * 37) % 9) * 30,
}));

const midShapes = Array.from({ length: 22 }, (_, i) => ({
  x: i * 260 + ((i * 47) % 120),
  w: 60 + ((i * 29) % 4) * 26,
  h: 40 + ((i * 53) % 6) * 22,
}));

const REDUCED = "(prefers-reduced-motion: reduce)";

// useSyncExternalStore rather than an effect, so neither the client-only gate
// nor the motion preference needs a setState during mount.
const neverChanges = () => () => {};

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

type Runtime = {
  x: number;
  cam: number;
  facing: number;
  moving: boolean;
  target: number | null;
  entering: boolean;
  onArrive: (() => void) | null;
};

export default function Playground() {
  const root = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);

  const rt = useRef<Runtime>({
    x: WORLD.startX,
    cam: 0,
    facing: 1,
    moving: false,
    target: null,
    entering: false,
    onArrive: null,
  });
  const keys = useRef(new Set<string>());
  const walkTl = useRef<gsap.core.Timeline | null>(null);

  const [closed, setClosed] = useState(false);
  const [near, setNear] = useState<number | null>(null);
  const [moved, setMoved] = useState(false);

  const mounted = useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  );

  // Reduced motion skips the playground entirely — a camera the visitor drives
  // is exactly the kind of thing that setting is asking us not to do.
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );

  const active = mounted && !reducedMotion && !closed;

  useEffect(() => {
    if (!active) return;
    lockScroll("playground");
    document.documentElement.classList.add("playground-open");
    return () => {
      document.documentElement.classList.remove("playground-open");
      unlockScroll("playground");
    };
  }, [active]);

  /** Tear down the overlay and hand the page back, optionally at a section. */
  const dismiss = useCallback((href?: string) => {
    gsap
      .timeline({ onComplete: () => setClosed(true) })
      // Cover the screen, reposition the page underneath, then dissolve the
      // cover — so the jump to the section is never visible.
      .to(wipeRef.current, { yPercent: 0, duration: 0.45, ease: "power3.inOut" })
      .add(() => {
        document.documentElement.classList.remove("playground-open");
        unlockScroll("playground");
        // The page was unscrollable until now; let ScrollTrigger re-measure
        // before we jump into the middle of it.
        ScrollTrigger.refresh();
        if (href) scrollToSection(href, true);
      })
      .to(root.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, "+=0.1");
  }, []);

  /** Walk to a door, then play the entry flourish. */
  const enter = useCallback(
    (i: number) => {
      const state = rt.current;
      if (state.entering) return;
      state.entering = true;
      state.target = stationX(i);
      state.onArrive = () => {
        const door =
          root.current?.querySelector<HTMLElement>(
            `.pg-door[data-i="${i}"] .pg-door-glow`,
          ) ?? null;

        const tl = gsap
          .timeline({ onComplete: () => dismiss(stations[i].href) })
          .to(charRef.current, {
            scale: 0.55,
            opacity: 0,
            y: -14,
            duration: 0.55,
            ease: "power2.in",
          });

        if (door) {
          tl.to(
            door,
            { opacity: 1, scaleY: 1.25, duration: 0.5, ease: "power2.out" },
            "-=0.35",
          );
        }
      };
    },
    [dismiss],
  );

  // Keyboard
  useEffect(() => {
    if (!active) return;

    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        keys.current.add("left");
        setMoved(true);
      }
      if (k === "arrowright" || k === "d") {
        keys.current.add("right");
        setMoved(true);
      }
      if (k === "enter" || k === "e") {
        if (near !== null) enter(near);
      }
      if (k === "escape") dismiss();
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") keys.current.delete("left");
      if (k === "arrowright" || k === "d") keys.current.delete("right");
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [active, near, enter, dismiss]);

  // Movement + camera loop
  useEffect(() => {
    if (!active) return;

    const state = rt.current;
    let vw = window.innerWidth;
    const onResize = () => {
      vw = window.innerWidth;
    };
    window.addEventListener("resize", onResize);

    const limbs = [".ch-leg-f", ".ch-leg-b", ".ch-arm-f", ".ch-arm-b"];

    gsap.set([".ch-leg", ".ch-arm"], { transformOrigin: "50% 8%" });
    // Seed opposite ends of the stride so the yoyo loops seamlessly.
    gsap.set(".ch-leg-f", { rotate: -24 });
    gsap.set(".ch-leg-b", { rotate: 24 });
    gsap.set(".ch-arm-f", { rotate: 22 });
    gsap.set(".ch-arm-b", { rotate: -22 });

    const stride = { duration: 0.32, repeat: -1, yoyo: true, ease: "sine.inOut" };
    walkTl.current = gsap
      .timeline({ paused: true })
      .to(".ch-leg-f", { rotate: 24, ...stride }, 0)
      .to(".ch-leg-b", { rotate: -24, ...stride }, 0)
      .to(".ch-arm-f", { rotate: -22, ...stride }, 0)
      .to(".ch-arm-b", { rotate: 22, ...stride }, 0)
      .to(
        ".ch-bob",
        { y: -4, duration: 0.16, repeat: -1, yoyo: true, ease: "sine.inOut" },
        0,
      );

    const idle = gsap.to(".ch-core", {
      opacity: 0.45,
      scale: 0.82,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      transformOrigin: "50% 50%",
    });

    let wasMoving = false;
    let lastFacing = 1;
    let lastNear: number | null = null;

    const tick = (_time: number, deltaMs: number) => {
      const delta = Math.min(deltaMs, 50) / 1000;

      let dir = 0;
      if (!state.entering) {
        if (keys.current.has("left")) dir -= 1;
        if (keys.current.has("right")) dir += 1;
      }

      // Click/tap target takes over when no key is held.
      if (dir === 0 && state.target !== null) {
        const diff = state.target - state.x;
        if (Math.abs(diff) < 8) {
          state.target = null;
          const arrive = state.onArrive;
          state.onArrive = null;
          if (arrive) arrive();
        } else {
          dir = Math.sign(diff);
        }
      }

      if (dir !== 0) {
        state.x += dir * WORLD.speed * delta;
        state.facing = dir;
        state.moving = true;
      } else {
        state.moving = false;
      }

      state.x = gsap.utils.clamp(80, worldWidth - 80, state.x);

      const maxCam = Math.max(0, worldWidth - vw);
      state.cam = gsap.utils.clamp(0, maxCam, state.x - vw / 2);

      gsap.set(charRef.current, { x: state.x });
      gsap.set(worldRef.current, { x: -state.cam });
      gsap.set(farRef.current, { x: -state.cam * 0.25 });
      gsap.set(midRef.current, { x: -state.cam * 0.55 });

      if (state.moving !== wasMoving) {
        wasMoving = state.moving;
        if (state.moving) {
          // Re-record start values from wherever the limbs settled, so
          // resuming the cycle doesn't snap.
          gsap.killTweensOf(limbs);
          walkTl.current?.invalidate().restart();
        } else {
          walkTl.current?.pause();
          gsap.to(limbs, { rotate: 0, duration: 0.25 });
          gsap.to(".ch-bob", { y: 0, duration: 0.25 });
        }
      }

      if (state.facing !== lastFacing) {
        lastFacing = state.facing;
        gsap.to(".ch-flip", { scaleX: state.facing, duration: 0.22 });
      }

      // Nearest enterable door.
      let found: number | null = null;
      for (let i = 0; i < stations.length; i++) {
        if (Math.abs(stationX(i) - state.x) < WORLD.reach) {
          found = i;
          break;
        }
      }
      if (found !== lastNear) {
        lastNear = found;
        setNear(found);
      }
    };

    gsap.ticker.add(tick);

    // Entrance — held back until the preloader has cleared, otherwise it
    // plays out of sight behind it. `from` sets the start values immediately,
    // so nothing flashes during the wait.
    gsap.from(root.current, { opacity: 0, duration: 0.9, delay: 2.5 });
    gsap.from(".pg-door", {
      opacity: 0,
      y: 50,
      duration: 1.1,
      stagger: 0.09,
      delay: 2.7,
    });
    gsap.from(charRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.9,
      delay: 2.9,
    });

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", onResize);
      walkTl.current?.kill();
      idle.kill();
    };
  }, [active]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (rt.current.entering) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, .pg-door")) return;
    rt.current.target = e.clientX + rt.current.cam;
    setMoved(true);
  };

  const hold = (side: "left" | "right", on: boolean) => {
    if (on) {
      keys.current.add(side);
      rt.current.target = null;
      setMoved(true);
    } else {
      keys.current.delete(side);
    }
  };

  if (!active) return null;

  return (
    <div
      ref={root}
      onPointerDown={onPointerDown}
      className="bg-ink fixed inset-0 z-60 touch-none overflow-hidden select-none"
    >
      {/* Sky */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_100%,rgba(226,84,44,0.16),transparent_60%)]" />

      {/* Far parallax */}
      <div ref={farRef} className="absolute inset-0">
        {farShapes.map((s, i) => (
          <div
            key={i}
            className="bg-ink-soft absolute rounded-t-sm"
            style={{
              left: s.x,
              width: s.w,
              height: s.h,
              bottom: GROUND,
              opacity: 0.55,
            }}
          />
        ))}
      </div>

      {/* Mid parallax */}
      <div ref={midRef} className="absolute inset-0">
        {midShapes.map((s, i) => (
          <div
            key={i}
            className="border-line absolute rounded-sm border bg-black/40"
            style={{ left: s.x, width: s.w, height: s.h, bottom: GROUND }}
          />
        ))}
      </div>

      {/* Floor */}
      <div
        className="bg-line absolute inset-x-0 h-px"
        style={{ bottom: GROUND }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(to_bottom,rgba(239,234,227,0.05),transparent)]"
        style={{ height: GROUND }}
      />

      {/* World layer: doors + character share this coordinate space */}
      <div
        ref={worldRef}
        className="absolute inset-y-0 left-0"
        style={{ width: worldWidth }}
      >
        {stations.map((station, i) => (
          <button
            key={station.id}
            type="button"
            data-i={i}
            onClick={() => enter(i)}
            className="pg-door absolute flex origin-bottom flex-col items-center"
            style={{ left: stationX(i), bottom: GROUND, translate: "-50% 0" }}
            aria-label={`Enter ${station.label}`}
          >
            <span className="label mb-3 !text-[10px]">{station.index}</span>
            <span
              className={`display mb-4 text-xl transition-colors duration-300 md:text-2xl ${
                near === i ? "text-bone" : "text-muted"
              }`}
            >
              {station.label}
            </span>

            <span className="relative block h-[190px] w-[112px] md:h-[240px] md:w-[136px]">
              {/* Frame */}
              <span className="border-line absolute inset-0 rounded-t-full border" />
              {/* Light spill */}
              <span
                className={`pg-door-glow absolute inset-[6px] origin-bottom rounded-t-full bg-[linear-gradient(to_top,rgba(226,84,44,0.55),rgba(226,84,44,0.05))] transition-opacity duration-500 ${
                  near === i ? "opacity-100" : "opacity-35"
                }`}
              />
              <span
                className={`bg-ember absolute -bottom-px left-1/2 h-px -translate-x-1/2 transition-all duration-500 ${
                  near === i ? "w-full" : "w-1/3"
                }`}
              />
            </span>

            <span
              className={`label mt-3 transition-opacity duration-300 ${
                near === i ? "opacity-100" : "opacity-0"
              }`}
            >
              {station.hint}
            </span>
          </button>
        ))}

        {/* Character */}
        <div
          ref={charRef}
          className="absolute left-0 -translate-x-1/2"
          style={{ bottom: GROUND }}
        >
          <Character />
        </div>
      </div>

      {/* --- HUD --- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6 md:p-10">
        <div>
          <p className="display text-2xl md:text-3xl">
            {profile.first}
            <span className="text-ember">.</span>
            {profile.last}
          </p>
          <p className="label mt-1">{profile.role}</p>
        </div>

        <button
          type="button"
          onClick={() => dismiss("#top")}
          className="label link-underline pointer-events-auto !text-bone"
        >
          Skip intro →
        </button>
      </div>

      {/* Prompt */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 p-6 md:p-10">
        <p
          className={`label transition-opacity duration-500 ${
            near !== null ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-ember">Enter</span> or tap the doorway
        </p>

        <p
          className={`label text-center transition-opacity duration-700 ${
            moved ? "opacity-0" : "opacity-100"
          }`}
        >
          ← → or A / D to walk · click anywhere to move · tap a door to enter
        </p>
      </div>

      {/* Touch controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-between px-6 md:hidden">
        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            aria-label={`Walk ${side}`}
            onPointerDown={() => hold(side, true)}
            onPointerUp={() => hold(side, false)}
            onPointerLeave={() => hold(side, false)}
            onPointerCancel={() => hold(side, false)}
            className="border-line text-bone pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border bg-black/50 text-xl backdrop-blur-sm"
          >
            {side === "left" ? "←" : "→"}
          </button>
        ))}
      </div>

      {/* Transition wipe */}
      <div
        ref={wipeRef}
        className="bg-ember pointer-events-none absolute inset-0 z-10 translate-y-full"
      />
    </div>
  );
}
