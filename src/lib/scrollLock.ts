import type Lenis from "lenis";

// Preloader (a layout effect) runs before SmoothScroll (a passive effect), so
// it always asks for the lock before the Lenis instance exists. Holding the
// intent here lets whichever arrives second do the right thing.
let instance: Lenis | null = null;
let locked = false;

export function registerLenis(lenis: Lenis) {
  instance = lenis;
  if (locked) lenis.stop();
}

export function unregisterLenis() {
  instance = null;
}

export function lockScroll() {
  locked = true;
  instance?.stop();
  // Fallback for the reduced-motion case, where Lenis is never installed.
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  locked = false;
  instance?.start();
  document.body.style.overflow = "";
}
