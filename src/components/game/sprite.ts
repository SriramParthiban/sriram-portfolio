/**
 * The character, hand-authored as pixel matrices.
 *
 * Built to Stardew's proportions after comparing side by side:
 *
 *  - The head, hair included, is a little over half the sprite. Realistic
 *    proportions read as a stiff mannequin at 16px; the chibi head is what
 *    gives the character its charm.
 *  - Eyes are 2px wide and 3px TALL — white, iris, pupil stacked. They are the
 *    dominant feature of the face. Two dark dots read as a doll.
 *  - Outlines are a dark tint of the fill, never black. A hard black keyline
 *    makes a 16px sprite look harsh and cut out.
 *  - The face sits high with bangs above it, so the head reads as a face with
 *    hair on top rather than a hair blob with a patch of skin at the bottom.
 *
 * 16 wide x 29 tall, so the head overlaps the tile above at 16px tiles.
 */

export type Dir = "down" | "up" | "left" | "right";

const COLORS: Record<string, string> = {
  k: "#3a2415", // outline — a dark warm brown, not black
  h: "#6b3d1c", // hair shadow
  H: "#96602f", // hair light
  n: "#d19a6b", // skin shade
  s: "#f7cfa3", // skin
  w: "#ffffff", // eye white
  i: "#4a7ba8", // iris
  e: "#1c2438", // pupil
  m: "#c4705a", // mouth
  c: "#e2542c", // shirt
  C: "#f5794c", // shirt lit
  d: "#a83c18", // shirt shadow
  p: "#3d4f74", // left trouser
  P: "#2a3854", // left trouser shade
  q: "#3d4f74", // right trouser
  Q: "#2a3854", // right trouser shade
  b: "#5a3a22", // left boot
  v: "#5a3a22", // right boot
};

/** Pixels belonging to each leg, so the walk cycle can lift them separately. */
const LEFT_LEG = new Set(["p", "P", "b"]);
const RIGHT_LEG = new Set(["q", "Q", "v"]);

export const SPRITE_W = 16;
export const SPRITE_H = 30;

const DOWN = [
  ".....kkkkkk.....",
  "...kkhhhhhhkk...",
  "..khhhhhhhhhhk..",
  ".khhhHHHHHHhhhk.",
  "khhhHHHHHHHHhhhk",
  "khhHHHHHHHHHHhhk",
  "khhHHHHkkHHHHhhk",
  "khhhHHHhhHHHhhhk",
  "khhnsshhhhssnhhk",
  "khhsssssssssshhk",
  "khsswwsssswwsshk",
  "khssiissssiisshk",
  "khsseesssseesshk",
  "khsnssssssssnshk",
  "khhsssmmmmssshhk",
  ".khsssssssssshk.",
  "..kksssssssskk..",
  ".....knnnnk.....",
  "...kccCCCCcck...",
  ".kckcCCCCCCckck.",
  ".kckcCCCCCCckck.",
  ".kskcCCCCCCcksk.",
  ".kskccCCCCccksk.",
  "...kcccccccck...",
  "...kddddddddk...",
  "....kppkkqqk....",
  "....kppkkqqk....",
  "....kPPkkQQk....",
  "....kbbkkvvk....",
  "....kkkkkkkk....",
];

const UP = [
  ".....kkkkkk.....",
  "...kkhhhhhhkk...",
  "..khhhhhhhhhhk..",
  ".khhhHHHHHHhhhk.",
  "khhhHHHHHHHHhhhk",
  "khhHHHHHHHHHHhhk",
  "khhHHHHkkHHHHhhk",
  "khhhHHHhhHHHhhhk",
  "khhhhhhhhhhhhhhk",
  "khhhhhhhhhhhhhhk",
  "khhhhhhhhhhhhhhk",
  "khhhhhhhhhhhhhhk",
  "khhhhhhhhhhhhhhk",
  "khhhhhhhhhhhhhhk",
  "khhhhhhhhhhhhhhk",
  ".khhhhhhhhhhhhk.",
  "..kkhhhhhhhhkk..",
  ".....knnnnk.....",
  "...kccCCCCcck...",
  ".kckcCCCCCCckck.",
  ".kckcCCCCCCckck.",
  ".kskcCCCCCCcksk.",
  ".kskccCCCCccksk.",
  "...kcccccccck...",
  "...kddddddddk...",
  "....kppkkqqk....",
  "....kppkkqqk....",
  "....kPPkkQQk....",
  "....kbbkkvvk....",
  "....kkkkkkkk....",
];

/** Right-facing profile. Left is drawn mirrored from this. */
const SIDE = [
  ".....kkkkkk.....",
  "...kkhhhhhhkk...",
  "..khhhhhhhhhhk..",
  ".khhhHHHHHHhhhk.",
  "khhhHHHHHHHHhhhk",
  "khhHHHHHHHHHHhhk",
  "khhHHHHHHHHHHhhk",
  "khhhHHHHHHHhhnsk",
  "khhhhHHHHhnssssk",
  "khhhhhhhsssssssk",
  "khhhhhhssswwsssk",
  "khhhhhhsssiisssk",
  "khhhhhhssseesssk",
  "khhhhhssssssnssk",
  "khhhhssssssmmssk",
  ".khhssssssssssk.",
  "..kksssssssskk..",
  ".....knnnnk.....",
  "...kccCCCCcck...",
  "...kcCCCCCCcknk.",
  "...kcCCCCCCcknk.",
  "...kcCCCCCCcksk.",
  "...kccCCCCccksk.",
  "...kcccccccck...",
  "...kddddddddk...",
  "....kppkkqqk....",
  "....kppkkqqk....",
  "....kPPkkQQk....",
  "....kbbkkvvk....",
  "....kkkkkkkk....",
];

const MATRIX: Record<Exclude<Dir, "left">, string[]> = {
  down: DOWN,
  up: UP,
  right: SIDE,
};

/** Per-frame vertical lift for each leg — a simple two-step contact cycle. */
const FRAMES: { left: number; right: number; bob: number }[] = [
  { left: 0, right: 0, bob: 0 },
  { left: 2, right: 0, bob: -1 },
  { left: 0, right: 0, bob: 0 },
  { left: 0, right: 2, bob: -1 },
];

export const FRAME_COUNT = FRAMES.length;

function renderFrame(rows: string[], frame: number, mirror: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  const f = FRAMES[frame];

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < SPRITE_W; x++) {
      const ch = row[x];
      if (!ch || ch === ".") continue;
      const color = COLORS[ch];
      if (!color) continue;

      let dy = f.bob;
      if (LEFT_LEG.has(ch)) dy = -f.left;
      else if (RIGHT_LEG.has(ch)) dy = -f.right;

      ctx.fillStyle = color;
      ctx.fillRect(mirror ? SPRITE_W - 1 - x : x, y + dy, 1, 1);
    }
  }

  return canvas;
}

let cache: Record<Dir, HTMLCanvasElement[]> | null = null;

function frames(): Record<Dir, HTMLCanvasElement[]> {
  if (cache) return cache;
  const build = (rows: string[], mirror = false) =>
    FRAMES.map((_, i) => renderFrame(rows, i, mirror));

  cache = {
    down: build(MATRIX.down),
    up: build(MATRIX.up),
    right: build(MATRIX.right),
    left: build(MATRIX.right, true),
  };
  return cache;
}

/**
 * @param x  feet centre, in world pixels
 * @param y  feet baseline, in world pixels
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: Dir,
  frameIndex: number,
  moving: boolean,
  time: number,
) {
  // Standing still, breathe on a slow cycle rather than freezing solid.
  const idle = moving ? 0 : Math.sin(time * 2.2) > 0.75 ? 1 : 0;
  const frame = moving ? frameIndex % FRAME_COUNT : 0;

  const px = Math.round(x);
  const py = Math.round(y);

  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(px - 6, py - 3, 12, 4);
  ctx.fillRect(px - 4, py - 4, 8, 1);

  ctx.drawImage(frames()[dir][frame], px - SPRITE_W / 2, py - SPRITE_H + idle);
}

/** Exposed so the sprite matrices can be checked outside the browser. */
export const SPRITE_SHEETS = { DOWN, UP, SIDE, COLORS };
