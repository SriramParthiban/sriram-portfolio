/**
 * Tree geometry, in its own import-free module because both the world (which
 * decides where trees may stand) and the renderer (which draws them) need it.
 *
 * The critical fact: a tree's trunk occupies ONE tile, but its canopy spreads
 * several tiles wide and reaches several tiles upward. Clearing trees whose
 * trunk sits on a road is not enough — a tree standing beside or below a road
 * will still blanket it. CANOPY is that overhang, in tiles.
 */
export const TREE_VARIANTS = [
  { w: 30, h: 42 },
  { w: 36, h: 52 },
  { w: 42, h: 60 },
] as const;

const maxW = Math.max(...TREE_VARIANTS.map((t) => t.w));
const maxH = Math.max(...TREE_VARIANTS.map((t) => t.h));

/**
 * How far the largest canopy reaches from its trunk tile, in tiles.
 * `up` is what matters most: canopies grow upward from the base, so a tree
 * *below* a road is the one that covers it.
 */
export const CANOPY = {
  side: Math.ceil(maxW / 2 / 16),
  up: Math.ceil(maxH / 16) - 1,
};
