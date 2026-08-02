/**
 * Fountain geometry, kept in its own module with no imports so it can be
 * loaded and checked outside the browser.
 *
 * The shape has to stay wide and tiered: each bowl markedly wider than the
 * stem under it, bowls widening downward, and the whole form wider than it is
 * tall. A narrow vertical shaft with a cap on top reads as something else
 * entirely — which is exactly what the first attempt did.
 */
export const FOUNTAIN = {
  cx: 24,
  height: 48,
  tiers: [
    { name: "top bowl", cy: 12, rx: 7.5, ry: 3.4 },
    { name: "middle bowl", cy: 21, rx: 13, ry: 5.5 },
    { name: "basin", cy: 33, rx: 23, ry: 11 },
  ],
  /** Width of the stem below each bowl, top to bottom. */
  stems: [4, 8],
  plinth: { cy: 37, rx: 22, ry: 9 },
} as const;
