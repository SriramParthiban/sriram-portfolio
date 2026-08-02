/**
 * The character, hand-authored as pixel matrices.
 *
 * The first version was assembled from rectangles, which is why it read as a
 * mannequin — rectangles cannot describe a hairline, a cheekbone or an eye.
 * Every pixel here is placed deliberately, the way a sprite actually gets made.
 *
 * 16 wide x 26 tall, so the head overlaps the tile above at 16px tiles.
 */

export type Dir = "down" | "up" | "left" | "right";

const COLORS: Record<string, string> = {
  o: "#17120e", // outline
  h: "#432814", // hair shadow
  H: "#6b401f", // hair mid
  L: "#96602f", // hair highlight
  s: "#f5c79b", // skin
  S: "#d19a6b", // skin shade
  w: "#ffffff", // eye white
  e: "#263449", // pupil
  c: "#e2542c", // shirt
  C: "#f5794c", // shirt lit
  d: "#a83c18", // shirt shadow
  p: "#3d4f74", // left trouser
  P: "#2a3854", // left trouser shade
  q: "#3d4f74", // right trouser
  Q: "#2a3854", // right trouser shade
  b: "#4a3020", // left boot
  v: "#4a3020", // right boot
};

/** Pixels belonging to each leg, so the walk cycle can lift them separately. */
const LEFT_LEG = new Set(["p", "P", "b"]);
const RIGHT_LEG = new Set(["q", "Q", "v"]);

export const SPRITE_W = 16;
export const SPRITE_H = 26;

const DOWN = [
  ".....oooooo.....",
  "...oohhhhhhoo...",
  "..ohhhhhhhhhho..",
  ".ohhhHHHHHHhhho.",
  ".ohhHHLLLLHHhho.",
  ".ohHHLLLLLLHHho.",
  ".ohHHHHHHHHHHho.",
  ".ohhssssssssHho.",
  ".ohssssssssssho.",
  ".ohswesssswesho.",
  ".ohswesssswesho.",
  ".ohsSssssssSsho.",
  ".ohssssSSssssho.",
  "..ohssssssssho..",
  "...ooSSSSSSoo...",
  ".occCCCCCCCCcco.",
  "oscCCCCCCCCCCcso",
  "oscCCCCCCCCCCcso",
  "osccCCCCCCCCccso",
  ".osccccccccccso.",
  ".oddddddddddddo.",
  "...opppo.oqqqo..",
  "...opppo.oqqqo..",
  "...oPPPo.oQQQo..",
  "...obbbo.ovvvo..",
  "...ooooo.ooooo..",
];

const UP = [
  ".....oooooo.....",
  "...oohhhhhhoo...",
  "..ohhhhhhhhhho..",
  ".ohhhHHHHHHhhho.",
  ".ohhHHLLLLHHhho.",
  ".ohHHLLLLLLHHho.",
  ".ohHHHHHHHHHHho.",
  ".ohhHHHHHHHHhho.",
  ".ohhhHHHHHHhhho.",
  ".ohhhhHHHHhhhho.",
  ".ohhhhhhhhhhhho.",
  ".ohhhhhhhhhhhho.",
  ".ohhhhhhhhhhhho.",
  "..ohhhhhhhhhho..",
  "...ooSSSSSSoo...",
  ".occCCCCCCCCcco.",
  "oscCCCCCCCCCCcso",
  "oscCCCCCCCCCCcso",
  "osccCCCCCCCCccso",
  ".osccccccccccso.",
  ".oddddddddddddo.",
  "...opppo.oqqqo..",
  "...opppo.oqqqo..",
  "...oPPPo.oQQQo..",
  "...obbbo.ovvvo..",
  "...ooooo.ooooo..",
];

/** Right-facing profile. Left is drawn mirrored from this. */
const SIDE = [
  ".....oooooo.....",
  "...oohhhhhhoo...",
  "..ohhhhhhhhhho..",
  ".ohhhHHHHHHhhho.",
  ".ohhHHLLLLLHHho.",
  ".ohhHHLLLLLLHho.",
  ".ohhHHHHHHHHHho.",
  ".ohhhhssssssSho.",
  ".ohhhsssssssSho.",
  ".ohhhswesssssho.",
  ".ohhhswesssssho.",
  ".ohhhsssssssSho.",
  ".ohhssssssSSsho.",
  "..ohsssssssssho.",
  "...ooSSSSSSoo...",
  ".occCCCCCCCCcco.",
  ".occCCCCCCCCcso.",
  ".occCCCCCCCCcso.",
  ".occCCCCCCCCcso.",
  ".occcccccccccso.",
  ".oddddddddddddo.",
  "....opppoqqqo...",
  "....opppoqqqo...",
  "....oPPPoQQQo...",
  "....obbbovvvo...",
  "....ooooooooo...",
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

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(px - 6, py - 3, 12, 4);
  ctx.fillRect(px - 4, py - 4, 8, 1);

  ctx.drawImage(frames()[dir][frame], px - SPRITE_W / 2, py - SPRITE_H + idle);
}

/** Exposed so the sprite matrices can be checked outside the browser. */
export const SPRITE_SHEETS = { DOWN, UP, SIDE, COLORS };
