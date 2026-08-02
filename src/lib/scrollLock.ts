import type Lenis from "lenis";

// Preloader (a layout effect) runs before SmoothScroll (a passive effect), so
// it always asks for the lock before the Lenis instance exists. Holding the
// intent here lets whichever arrives second do the right thing.
let instance: Lenis | null = null;

// Keyed rather than counted: the preloader and the playground overlap, and
// each releases its own hold without cancelling the other's. Keys also make
// repeat calls from React cleanup idempotent.
const holders = new Set<string>();

function apply() {
  if (holders.size > 0) {
    instance?.stop();
    document.body.style.overflow = "hidden";
  } else {
    instance?.start();
    document.body.style.overflow = "";
  }
}

export function registerLenis(lenis: Lenis) {
  instance = lenis;
  apply();
}

export function unregisterLenis() {
  instance = null;
}

export function lockScroll(key: string) {
  holders.add(key);
  apply();
}

export function unlockScroll(key: string) {
  holders.delete(key);
  apply();
}

/** Jump to a section, using Lenis when it is running so the easing matches. */
export function scrollToSection(selector: string, immediate = false) {
  const target = document.querySelector<HTMLElement>(selector);
  if (!target) return;

  if (instance) {
    instance.scrollTo(target, { immediate, offset: 0 });
    return;
  }
  target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
}
