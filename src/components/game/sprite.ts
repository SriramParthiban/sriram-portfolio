/**
 * The character, hand-authored as pixel matrices.
 *
 * Built to Stardew's proportions after comparing side by side:
 *
 *  - The head, hair included, is a little over half the sprite. Realistic
 *    proportions read as a stiff mannequin at 16px.
 *  - Eyes are 2px wide and 3px TALL — white, iris, pupil stacked.
 *  - Outlines are a dark tint of the fill, never black.
 *  - The torso is clearly narrower than the head, with a neck and a waist.
 *    Matching widths reads as two stacked circles.
 *
 * The walk is a proper four-frame cycle: contact, pass, contact, pass. Legs get
 * a whole pose per frame rather than being nudged up and down — a leg that only
 * bobs vertically reads as sliding, not walking — and the arms swing opposite
 * to them while the body rises on the passing frames.
 *
 * 16 wide x 30 tall: 25 rows of body plus a 5-row leg pose.
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
  // Arms are tagged separately from the torso so they can swing.
  x: "#3a2415", // left arm outline
  X: "#3a2415", // right arm outline
  a: "#e2542c", // left sleeve
  A: "#e2542c", // right sleeve
  j: "#f7cfa3", // left hand
  J: "#f7cfa3", // right hand
  p: "#3d4f74", // left trouser
  P: "#2a3854", // left trouser shade
  q: "#3d4f74", // right trouser
  Q: "#2a3854", // right trouser shade
  b: "#5a3a22", // left boot
  v: "#5a3a22", // right boot
};

const LEFT_ARM = new Set(["x", "a", "j"]);
const RIGHT_ARM = new Set(["X", "A", "J"]);

export const SPRITE_W = 16;
export const BODY_ROWS = 25;
export const LEG_ROWS = 5;
export const SPRITE_H = BODY_ROWS + LEG_ROWS;

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
  ".xaxcCCCCCCcXAX.",
  ".xaxcCCCCCCcXAX.",
  ".xjxcCCCCCCcXJX.",
  ".xjxccCCCCccXJX.",
  "...kcccccccck...",
  "...kddddddddk...",
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
  ".xaxcCCCCCCcXAX.",
  ".xaxcCCCCCCcXAX.",
  ".xjxcCCCCCCcXJX.",
  ".xjxccCCCCccXJX.",
  "...kcccccccck...",
  "...kddddddddk...",
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
  "...kcCCCCCCcXAX.",
  "...kcCCCCCCcXAX.",
  "...kcCCCCCCcXJX.",
  "...kccCCCCccXJX.",
  "...kcccccccck...",
  "...kddddddddk...",
];

/**
 * Four leg poses: contact, stride, contact, opposite stride. The planted foot
 * keeps its sole row; the trailing foot lifts off it. Whole poses rather than
 * offsets, because a stride needs the legs to move apart, not just up.
 */
const LEGS: string[][] = [
  [
    "....kppkkqqk....",
    "....kppkkqqk....",
    "....kPPkkQQk....",
    "....kbbkkvvk....",
    "....kkkkkkkk....",
  ],
  [
    "...kppk.kqqk....",
    "...kppk.kqqk....",
    "...kPPk.kQQk....",
    "..kbbk...kvvk...",
    "..kkkk...kkkk...",
  ],
  [
    "....kppkkqqk....",
    "....kppkkqqk....",
    "....kPPkkQQk....",
    "....kbbkkvvk....",
    "....kkkkkkkk....",
  ],
  [
    "....kppk.kqqk...",
    "....kppk.kqqk...",
    "....kPPk.kQQk...",
    "...kbbk...kvvk..",
    "...kkkk...kkkk..",
  ],
];

const MATRIX: Record<Exclude<Dir, "left">, string[]> = {
  down: DOWN,
  up: UP,
  right: SIDE,
};

/** Body rise and arm swing per frame. Arms lead opposite the legs. */
const FRAMES: { bob: number; armL: number; armR: number }[] = [
  { bob: 0, armL: 0, armR: 0 },
  { bob: -1, armL: -1, armR: 1 },
  { bob: 0, armL: 0, armR: 0 },
  { bob: -1, armL: 1, armR: -1 },
];

export const FRAME_COUNT = FRAMES.length;

function renderFrame(body: string[], frame: number, mirror: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_W;
  canvas.height = SPRITE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  const f = FRAMES[frame];
  const put = (x: number, y: number, ch: string) => {
    const color = COLORS[ch];
    if (!color) return;
    ctx.fillStyle = color;
    ctx.fillRect(mirror ? SPRITE_W - 1 - x : x, y, 1, 1);
  };

  // Body rises on the passing frames; arms swing against each other.
  for (let y = 0; y < body.length; y++) {
    const row = body[y];
    for (let x = 0; x < SPRITE_W; x++) {
      const ch = row[x];
      if (!ch || ch === ".") continue;
      let dy = f.bob;
      if (LEFT_ARM.has(ch)) dy += f.armL;
      else if (RIGHT_ARM.has(ch)) dy += f.armR;
      put(x, y + dy, ch);
    }
  }

  // Feet stay on the ground — only the body bobs.
  const legs = LEGS[frame];
  for (let y = 0; y < legs.length; y++) {
    const row = legs[y];
    for (let x = 0; x < SPRITE_W; x++) {
      const ch = row[x];
      if (!ch || ch === ".") continue;
      put(x, BODY_ROWS + y, ch);
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
export const SPRITE_SHEETS = { DOWN, UP, SIDE, LEGS, COLORS, FRAMES };
