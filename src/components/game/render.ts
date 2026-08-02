import { drawText, textWidth } from "./font";
import {
  Building,
  IconKind,
  MAP_H,
  MAP_W,
  PropKind,
  TILE,
  Terrain,
  terrainAt,
} from "./world";

type RGB = [number, number, number];

/* ------------------------------------------------------------------ noise */

/** Deterministic hash in [0,1). Math.random would change every reload. */
function hash2(x: number, y: number) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function smoothNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

/** Two octaves is enough texture at this scale and keeps map build fast. */
function fbm(x: number, y: number) {
  return smoothNoise(x, y) * 0.65 + smoothNoise(x * 2.3, y * 2.3) * 0.35;
}

const pick = (ramp: RGB[], t: number) =>
  ramp[Math.min(ramp.length - 1, Math.max(0, Math.floor(t * ramp.length)))];

/* --------------------------------------------------------------- palettes */

// Saturated and warm. The first pass was desaturated, which reads as washed
// out no matter how much per-pixel detail sits underneath it.
const GRASS: RGB[] = [
  [52, 100, 36],
  [68, 126, 44],
  [86, 150, 52],
  [106, 174, 62],
  [128, 198, 76],
];
const PATH: RGB[] = [
  [150, 108, 62],
  [174, 130, 78],
  [196, 152, 94],
  [214, 174, 112],
  [230, 196, 134],
];
const STONE: RGB[] = [
  [128, 112, 94],
  [150, 132, 110],
  [172, 152, 128],
  [190, 172, 148],
  [208, 190, 166],
];
const WATER: RGB[] = [
  [36, 92, 132],
  [44, 112, 156],
  [56, 134, 178],
  [72, 158, 198],
  [96, 184, 218],
];
const SAND: RGB[] = [
  [196, 168, 116],
  [212, 184, 132],
  [224, 198, 148],
  [234, 210, 162],
  [242, 222, 178],
];

export const PAL = {
  wood: "#7a5a3a",
  woodDark: "#5b4029",
  woodLight: "#96754d",
  ink: "#2a1f18",
  bone: "#efeae3",
  ember: "#e2542c",
  amber: "#f0c874",
} as const;

/* ------------------------------------------------------- terrain painting */

/** Which terrain wins where two meet. Higher creeps over lower. */
const RANK: Record<number, number> = {
  [Terrain.Path]: 0,
  [Terrain.Plaza]: 0,
  [Terrain.Water]: 1,
  [Terrain.Sand]: 2,
  [Terrain.Grass]: 3,
  [Terrain.Flowers]: 3,
  [Terrain.Tree]: 3,
  [Terrain.Bush]: 3,
  [Terrain.Rock]: 3,
  [Terrain.Fence]: 3,
};

/** Tree/bush/rock/fence sit *on* grass — the ground beneath them is grass. */
function baseTerrain(tx: number, ty: number): number {
  const t = terrainAt(tx, ty);
  if (
    t === Terrain.Tree ||
    t === Terrain.Bush ||
    t === Terrain.Rock ||
    t === Terrain.Fence ||
    t === Terrain.Flowers
  ) {
    return Terrain.Grass;
  }
  return t;
}

function shade(t: number, px: number, py: number): RGB {
  switch (t) {
    case Terrain.Water: {
      const n = fbm(px * 0.16, py * 0.16);
      return pick(WATER, n * 0.75 + 0.1);
    }
    case Terrain.Sand: {
      const n = fbm(px * 0.4, py * 0.4);
      const speck = hash2(px, py);
      if (speck > 0.965) return SAND[0];
      return pick(SAND, n);
    }
    case Terrain.Path: {
      const n = fbm(px * 0.3, py * 0.3);
      const g = hash2(px, py);
      // Grit and small stones scattered through the dirt.
      if (g > 0.985) return [96, 92, 86];
      if (g > 0.955) return PATH[0];
      if (g < 0.03) return PATH[4];
      return pick(PATH, n);
    }
    case Terrain.Plaza: {
      // Cobbles: offset rows of cells with mortar joints between them.
      const row = Math.floor(py / 5);
      const off = (row % 2) * 3;
      const col = Math.floor((px + off) / 6);
      if ((px + off) % 6 === 0 || py % 5 === 0) return [86, 82, 76];
      const cell = hash2(col, row);
      const n = fbm(px * 0.5, py * 0.5) * 0.35 + cell * 0.65;
      return pick(STONE, n);
    }
    default: {
      // Two scales of noise: broad clumps of lighter and darker growth, then
      // fine variation inside them. Uniform noise alone looks like static —
      // the clumping is what reads as grass.
      const clump = smoothNoise(px * 0.055, py * 0.055);
      const fine = fbm(px * 0.34, py * 0.34);
      const blade = hash2(px, py);

      // Individual blades catching the light, and bare patches.
      if (blade > 0.968) return GRASS[4];
      if (blade > 0.94) return GRASS[3];
      if (blade < 0.02) return GRASS[0];

      return pick(GRASS, clump * 0.62 + fine * 0.38);
    }
  }
}

/**
 * The whole ground is composed pixel by pixel into an ImageData. Painting it
 * with fillRect at this level of detail would be tens of thousands of calls;
 * writing bytes is one pass and gives per-pixel control over edges.
 */
export function buildGroundCanvas() {
  const W = MAP_W * TILE;
  const H = MAP_H * TILE;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  const img = ctx.createImageData(W, H);
  const data = img.data;

  const NEIGHBOURS: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let py = 0; py < H; py++) {
    const ty = py >> 4;
    const ly = py & 15;

    for (let px = 0; px < W; px++) {
      const tx = px >> 4;
      const lx = px & 15;

      let t = baseTerrain(tx, ty);
      let best = RANK[t] ?? 3;

      // Irregular fringe so terrain boundaries are organic, not straight
      // tile edges. This single step does most of the work of an autotiler.
      // Two frequencies: broad lobes plus a fine ragged edge on top.
      const fringe =
        1.5 +
        smoothNoise(px * 0.12, py * 0.12) * 4.5 +
        fbm(px * 0.7, py * 0.7) * 2.5;

      for (const [dx, dy] of NEIGHBOURS) {
        const nt = baseTerrain(tx + dx, ty + dy);
        const rank = RANK[nt] ?? 3;
        if (rank <= best) continue;
        const dist =
          dx === -1 ? lx : dx === 1 ? 15 - lx : dy === -1 ? ly : 15 - ly;
        if (dist < fringe) {
          t = nt;
          best = rank;
        }
      }

      let c = shade(t, px, py);

      // Darken the waterline where sand meets water for definition.
      if (t === Terrain.Water) {
        let nearShore = false;
        for (const [dx, dy] of NEIGHBOURS) {
          const d = dx === -1 ? lx : dx === 1 ? 15 - lx : dy === -1 ? ly : 15 - ly;
          if (d < 2 && baseTerrain(tx + dx, ty + dy) === Terrain.Sand) {
            nearShore = true;
          }
        }
        if (nearShore) c = [c[0] - 14, c[1] - 12, c[2] - 8];
      }

      const i = (py * W + px) * 4;
      data[i] = c[0];
      data[i + 1] = c[1];
      data[i + 2] = c[2];
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  paintGroundDetail(ctx);
  return canvas;
}

/** Flowers, bushes, rocks and fences — static, so they bake into the ground. */
function paintGroundDetail(ctx: CanvasRenderingContext2D) {
  const rect = (x: number, y: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const t = terrainAt(tx, ty);
      const x = tx * TILE;
      const y = ty * TILE;
      const h = hash2(tx, ty);
      const h2 = hash2(tx + 401, ty + 977);

      if (t === Terrain.Flowers) {
        const kinds: [string, string][] = [
          ["#e0574a", "#f2a09a"],
          ["#e8c04a", "#f7e0a2"],
          ["#d492c4", "#f0cfe6"],
          ["#f0f0f0", "#ffffff"],
        ];
        const count = 2 + Math.floor(h * 3);
        for (let i = 0; i < count; i++) {
          const fx = x + 2 + Math.floor(hash2(tx * 7 + i, ty * 13) * 11);
          const fy = y + 3 + Math.floor(hash2(tx * 11, ty * 5 + i) * 10);
          const [petal, core] = kinds[Math.floor(hash2(i, tx + ty) * 4)];
          rect(fx + 1, fy + 2, 1, 3, "#3f6b34"); // stem
          rect(fx, fy, 3, 1, petal);
          rect(fx, fy + 1, 1, 1, petal);
          rect(fx + 2, fy + 1, 1, 1, petal);
          rect(fx + 1, fy + 1, 1, 1, core);
        }
      }

      if (t === Terrain.Bush) {
        rect(x + 2, y + 12, 12, 3, "rgba(0,0,0,0.18)");
        rect(x + 2, y + 4, 12, 10, "#255021");
        rect(x + 3, y + 3, 10, 10, "#2f6329");
        rect(x + 4, y + 4, 7, 6, "#3c7a33");
        rect(x + 5, y + 4, 4, 3, "#4b8f3e");
        // Berries
        if (h > 0.55) {
          rect(x + 5, y + 8, 2, 2, "#c8402f");
          rect(x + 10, y + 6, 2, 2, "#c8402f");
        }
        rect(x + 3, y + 12, 2, 2, "#1d4019");
        rect(x + 11, y + 11, 2, 2, "#1d4019");
      }

      if (t === Terrain.Rock) {
        rect(x + 2, y + 12, 12, 3, "rgba(0,0,0,0.2)");
        rect(x + 3, y + 5, 10, 9, "#4f4c47");
        rect(x + 4, y + 4, 8, 9, "#6b6862");
        rect(x + 5, y + 5, 5, 5, "#83807a");
        rect(x + 6, y + 5, 3, 2, "#9b988f");
        rect(x + 4, y + 11, 8, 2, "#413e3a");
        // Moss
        if (h2 > 0.5) rect(x + 10, y + 9, 3, 2, "#4a7038");
      }

      if (t === Terrain.Fence) {
        rect(x, y + 13, TILE, 2, "rgba(0,0,0,0.18)");
        rect(x + 2, y + 3, 3, 11, "#5b4029");
        rect(x + 3, y + 3, 1, 11, "#8a6a45");
        rect(x + 11, y + 3, 3, 11, "#5b4029");
        rect(x + 12, y + 3, 1, 11, "#8a6a45");
        rect(x, y + 5, TILE, 2, "#7a5a3a");
        rect(x, y + 5, TILE, 1, "#96754d");
        rect(x, y + 10, TILE, 2, "#7a5a3a");
        rect(x, y + 10, TILE, 1, "#96754d");
      }

      // Loose pebbles and tufts scattered on paths and grass.
      if (t === Terrain.Path && h > 0.86) {
        rect(x + 4, y + 7, 2, 1, "#8d7053");
        rect(x + 9, y + 11, 1, 1, "#a08464");
      }
      if (t === Terrain.Grass && h > 0.9) {
        rect(x + 6, y + 9, 1, 3, "#5c8f45");
        rect(x + 7, y + 8, 1, 4, "#6ba350");
        rect(x + 8, y + 10, 1, 2, "#5c8f45");
      }
    }
  }
}

/** Animated shimmer, drawn over the static water each frame. */
export function drawWater(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  time: number,
) {
  const x = tx * TILE;
  const y = ty * TILE;
  for (let i = 0; i < 2; i++) {
    const phase = Math.sin(time * 1.3 + tx * 0.7 + ty * 0.9 + i * 2.1);
    if (phase < 0.55) continue;
    ctx.fillStyle = i ? "rgba(190,225,240,0.30)" : "rgba(150,205,228,0.38)";
    const wx = x + 2 + ((i * 7) % 8);
    const wy = y + 4 + i * 6;
    ctx.fillRect(wx, wy, 5, 1);
    if (phase > 0.85) ctx.fillRect(wx + 6, wy + 1, 3, 1);
  }
}

/* ---------------------------------------------------- pre-rendered sprites */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (ctx) ctx.imageSmoothingEnabled = false;
  return { c, ctx: ctx as CanvasRenderingContext2D };
}

/* -- trees -- */

export const TREE_W = 48;
export const TREE_H = 72;

const TREE_GREENS: RGB[][] = [
  [
    [26, 58, 26],
    [35, 76, 32],
    [46, 94, 40],
    [60, 114, 50],
    [78, 136, 62],
  ],
  [
    [22, 50, 34],
    [30, 66, 44],
    [40, 84, 54],
    [52, 102, 66],
    [68, 122, 80],
  ],
  [
    [40, 56, 24],
    [52, 72, 30],
    [66, 90, 38],
    [82, 108, 48],
    [100, 128, 60],
  ],
];

/** Three tree variants, drawn once and blitted — canopies are dense. */
function makeTree(variant: number) {
  const { c, ctx } = makeCanvas(TREE_W, TREE_H);
  if (!ctx) return c;

  const greens = TREE_GREENS[variant];
  const cx = TREE_W / 2;
  const baseY = TREE_H - 4;

  // Ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(cx - 9, baseY - 3, 18, 5);
  ctx.fillRect(cx - 11, baseY - 2, 22, 3);

  // Trunk with bark grain and roots
  const trunkTop = baseY - 30;
  ctx.fillStyle = "#3d2b1c";
  ctx.fillRect(cx - 4, trunkTop, 8, 30);
  ctx.fillStyle = "#54391f";
  ctx.fillRect(cx - 3, trunkTop, 5, 30);
  ctx.fillStyle = "#6b4a2a";
  ctx.fillRect(cx - 3, trunkTop, 2, 30);
  for (let i = 0; i < 7; i++) {
    const gy = trunkTop + 3 + i * 4;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(cx - 2 + ((i % 2) * 2), gy, 2, 1);
  }
  // Roots flaring out at the base
  ctx.fillStyle = "#3d2b1c";
  ctx.fillRect(cx - 7, baseY - 4, 4, 3);
  ctx.fillRect(cx + 3, baseY - 4, 4, 3);
  ctx.fillRect(cx - 5, baseY - 2, 10, 2);

  // Canopy: blobby mass built from noise, then shaded top-left to bottom-right
  const canopyCX = cx;
  const canopyCY = variant === 1 ? 24 : 22;
  const rx = variant === 1 ? 17 : 21;
  const ry = variant === 1 ? 22 : 18;

  for (let y = 0; y < canopyCY + ry; y++) {
    for (let x = 0; x < TREE_W; x++) {
      const dx = (x - canopyCX) / rx;
      const dy = (y - canopyCY) / ry;
      const d = dx * dx + dy * dy;
      // Noise on the silhouette so the outline is ragged, not an ellipse.
      const edge = 1 + (fbm(x * 0.22, y * 0.22) - 0.5) * 0.55;
      if (d > edge) continue;

      // Light from the upper left.
      const lit = 1 - d * 0.55 - (x - canopyCX) * 0.012 + (canopyCY - y) * 0.016;
      const n = fbm(x * 0.5, y * 0.5) * 0.4 + lit * 0.6;
      const g = pick(greens, Math.max(0, Math.min(0.999, n)));

      // Occasional gaps let the sky through, like Stardew's leafy edges.
      if (d > 0.62 && hash2(x + variant * 31, y) > 0.87) continue;

      ctx.fillStyle = `rgb(${g[0]},${g[1]},${g[2]})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Highlight clusters on the sunlit side
  ctx.fillStyle = `rgba(${greens[4][0]},${greens[4][1]},${greens[4][2]},0.85)`;
  for (let i = 0; i < 14; i++) {
    const a = hash2(i, variant) * Math.PI * 2;
    const r = hash2(i + 9, variant) * 0.55;
    const hx = Math.round(canopyCX + Math.cos(a) * rx * r - 4);
    const hy = Math.round(canopyCY + Math.sin(a) * ry * r - 5);
    ctx.fillRect(hx, hy, 2, 2);
  }

  return c;
}

let treeSprites: HTMLCanvasElement[] | null = null;

export function drawTree(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
) {
  if (!treeSprites) treeSprites = [makeTree(0), makeTree(1), makeTree(2)];
  const variant = Math.floor(hash2(tx, ty) * 3) % 3;
  const sprite = treeSprites[variant];
  // Anchor: bottom-centre of the sprite sits on the bottom-centre of the tile.
  ctx.drawImage(
    sprite,
    tx * TILE + TILE / 2 - TREE_W / 2,
    (ty + 1) * TILE - TREE_H + 2,
  );
}

/* -- pictograms for the signs -- */

function drawIcon(
  ctx: CanvasRenderingContext2D,
  kind: IconKind,
  x: number,
  y: number,
) {
  const r = (rx: number, ry: number, w: number, h: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x + rx, y + ry, w, h);
  };

  switch (kind) {
    case "book":
      r(0, 1, 5, 9, "#8c4a3a");
      r(5, 1, 5, 9, "#a35944");
      r(4, 0, 2, 11, "#5d2f24");
      r(1, 3, 3, 1, "#efeae3");
      r(1, 5, 3, 1, "#efeae3");
      r(6, 3, 3, 1, "#efeae3");
      r(6, 5, 3, 1, "#efeae3");
      break;
    case "gear":
      r(3, 0, 4, 10, "#c7c2b8");
      r(0, 3, 10, 4, "#c7c2b8");
      r(1, 1, 3, 3, "#a8a49b");
      r(6, 6, 3, 3, "#a8a49b");
      r(6, 1, 3, 3, "#a8a49b");
      r(1, 6, 3, 3, "#a8a49b");
      r(4, 4, 2, 2, "#5b5751");
      break;
    case "anvil":
      r(1, 2, 8, 3, "#6e6a64");
      r(0, 3, 10, 2, "#83807a");
      r(3, 5, 4, 3, "#5b5751");
      r(1, 8, 8, 2, "#6e6a64");
      r(2, 2, 5, 1, "#9b988f");
      break;
    case "frame":
      r(0, 0, 10, 10, "#8a6a34");
      r(1, 1, 8, 8, "#2b3a4a");
      r(2, 5, 3, 3, "#4a7038");
      r(5, 3, 3, 5, "#3f6b34");
      r(6, 2, 2, 2, "#e8c04a");
      break;
    case "trophy":
      r(2, 0, 6, 5, "#e8c04a");
      r(0, 1, 2, 3, "#e8c04a");
      r(8, 1, 2, 3, "#e8c04a");
      r(4, 5, 2, 3, "#c8a234");
      r(2, 8, 6, 2, "#c8a234");
      r(3, 1, 2, 2, "#f7e0a2");
      break;
    case "mail":
      r(0, 1, 10, 8, "#efeae3");
      r(0, 1, 10, 1, "#c9c3ba");
      r(1, 2, 8, 1, "#c9c3ba");
      r(2, 3, 6, 1, "#c9c3ba");
      r(3, 4, 4, 1, "#c9c3ba");
      r(0, 8, 10, 1, "#c9c3ba");
      break;
  }
}

/* -- buildings -- */

const buildingCache = new Map<string, { canvas: HTMLCanvasElement; ox: number; oy: number }>();

const SIGN_PAD = 5;
const OVERHANG = 6;
const TOP_MARGIN = 34;

function makeBuilding(b: Building) {
  const w = b.w * TILE;
  const h = b.h * TILE;
  const cw = w + OVERHANG * 2;
  const ch = h + TOP_MARGIN;
  const { c, ctx } = makeCanvas(cw, ch);
  if (!ctx) return { canvas: c, ox: OVERHANG, oy: TOP_MARGIN };

  const x0 = OVERHANG;
  const y0 = TOP_MARGIN;
  const roofH = Math.floor(h * 0.44);
  const wallTop = y0 + roofH;
  const wallH = h - roofH;

  const r = (rx: number, ry: number, rw: number, rh: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(rx, ry, rw, rh);
  };

  /* ---- ground shadow ---- */
  r(x0 + 2, y0 + h - 3, w - 4, 6, "rgba(0,0,0,0.25)");
  r(x0 - 2, y0 + h - 1, w + 4, 3, "rgba(0,0,0,0.16)");

  /* ---- walls: vertical planks with grain ---- */
  const wall = b.wall;
  const wallRGB = hexToRgb(wall);
  for (let px = 0; px < w; px++) {
    const plank = Math.floor(px / 7);
    const tone = hash2(plank, b.x) * 0.22 - 0.11;
    const seam = px % 7 === 0;
    for (let py = 0; py < wallH; py++) {
      const grain = (fbm(px * 0.9, py * 0.35) - 0.5) * 0.14;
      let k = 1 + tone + grain;
      if (seam) k *= 0.72;
      // Ambient occlusion under the eaves and at the base.
      if (py < 4) k *= 0.62 + py * 0.09;
      if (py > wallH - 6) k *= 0.78;
      ctx.fillStyle = scale(wallRGB, k);
      ctx.fillRect(x0 + px, wallTop + py, 1, 1);
    }
  }

  /* ---- stone foundation ---- */
  const footY = y0 + h - 7;
  for (let px = 0; px < w; px++) {
    for (let py = 0; py < 7; py++) {
      const block = Math.floor((px + (py > 3 ? 5 : 0)) / 11);
      const n = hash2(block, py > 3 ? 1 : 0) * 0.5 + 0.35;
      const joint = (px + (py > 3 ? 5 : 0)) % 11 === 0 || py === 3;
      const col = joint ? [60, 57, 53] : pick(STONE, n);
      ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
      ctx.fillRect(x0 + px, footY + py, 1, 1);
    }
  }

  /* ---- corner posts ---- */
  r(x0, wallTop, 3, wallH, shadeHex(b.wall, 0.62));
  r(x0 + w - 3, wallTop, 3, wallH, shadeHex(b.wall, 0.62));
  r(x0 + 1, wallTop, 1, wallH, shadeHex(b.wall, 1.25));

  /* ---- windows ---- */
  const winY = wallTop + 9;
  const winW = 18;
  const winH = 16;
  const slots = b.w >= 7 ? [6, w - winW - 6] : [5, w - winW - 5];
  for (const sx of slots) {
    const wx = x0 + sx;
    // Frame + sill
    r(wx - 2, winY - 2, winW + 4, winH + 4, shadeHex(b.wall, 0.5));
    r(wx - 3, winY + winH + 2, winW + 6, 3, "#8a6a45");
    r(wx - 3, winY + winH + 2, winW + 6, 1, "#a8845c");
    // Glass, warm from inside
    for (let gx = 0; gx < winW; gx++) {
      for (let gy = 0; gy < winH; gy++) {
        const t = 1 - gy / winH;
        const glow = 150 + t * 70 + hash2(gx, gy) * 14;
        ctx.fillStyle = `rgb(${Math.min(255, glow + 40)},${Math.min(
          255,
          glow * 0.82,
        )},${Math.min(255, glow * 0.42)})`;
        ctx.fillRect(wx + gx, winY + gy, 1, 1);
      }
    }
    // Muntins
    r(wx + winW / 2 - 1, winY, 2, winH, shadeHex(b.wall, 0.55));
    r(wx, winY + winH / 2 - 1, winW, 2, shadeHex(b.wall, 0.55));
    // Curtain
    r(wx, winY, winW, 3, "rgba(200,80,50,0.55)");
    // Reflection
    r(wx + 2, winY + 2, 4, 5, "rgba(255,255,255,0.22)");

    // Painted shutters either side — the detail that turns a hole in a wall
    // into a cottage window.
    for (const side of [-1, 1]) {
      const sx2 = side < 0 ? wx - 8 : wx + winW + 2;
      r(sx2, winY - 2, 6, winH + 4, "#2f6b3a");
      r(sx2, winY - 2, 6, 1, "#48926f");
      r(sx2 + (side < 0 ? 5 : 0), winY - 2, 1, winH + 4, "#1e4a27");
      for (let sl = 2; sl < winH + 1; sl += 4) {
        r(sx2 + 1, winY - 2 + sl, 4, 1, "rgba(0,0,0,0.28)");
        r(sx2 + 1, winY - 1 + sl, 4, 1, "#3d7f4b");
      }
    }
  }

  /* ---- door with frame, panels, step ---- */
  const doorLocalX = (b.doorX - b.x) * TILE;
  const dx = x0 + doorLocalX;
  const doorH = 26;
  const dy = y0 + h - doorH - 2;
  r(dx - 4, dy - 4, TILE + 8, doorH + 4, shadeHex(b.wall, 0.45));
  r(dx - 3, dy - 3, TILE + 6, doorH + 3, "#8a6a45");
  r(dx, dy, TILE, doorH, "#4a3222");
  r(dx + 1, dy + 1, TILE - 2, doorH - 2, "#5c3f2a");
  // Panels
  r(dx + 3, dy + 3, 10, 8, "#4a3222");
  r(dx + 3, dy + 13, 10, 9, "#4a3222");
  r(dx + 4, dy + 4, 8, 6, "#6b4a30");
  r(dx + 4, dy + 14, 8, 7, "#6b4a30");
  // Handle
  r(dx + TILE - 5, dy + 13, 2, 2, "#e8c04a");
  // Stone step
  r(dx - 3, y0 + h - 3, TILE + 6, 4, "#8f8a82");
  r(dx - 3, y0 + h - 3, TILE + 6, 1, "#a8a49b");

  /* ---- porch overhang above the door ---- */
  r(dx - 8, dy - 9, TILE + 16, 5, shadeHex(b.roof, 0.85));
  r(dx - 8, dy - 9, TILE + 16, 2, shadeHex(b.roof, 1.15));
  r(dx - 8, dy - 4, TILE + 16, 2, "rgba(0,0,0,0.3)");

  /* ---- roof: shingle courses ---- */
  const roofRGB = hexToRgb(b.roof);
  const rx0 = x0 - OVERHANG;
  const rw = w + OVERHANG * 2;
  const course = 5;
  for (let ry = 0; ry < roofH; ry++) {
    const row = Math.floor(ry / course);
    const offset = (row % 2) * 6;
    for (let px = 0; px < rw; px++) {
      const shingle = Math.floor((px + offset) / 12);
      const v = hash2(shingle, row) * 0.26 - 0.13;
      // Each course is darker at its lower lip, which is what reads as depth.
      const lip = ry % course === course - 1 ? 0.6 : 1;
      const top = 1 - (ry / roofH) * 0.28;
      const edge = (px + offset) % 12 === 0 ? 0.78 : 1;
      ctx.fillStyle = scale(roofRGB, (1 + v) * lip * top * edge);
      ctx.fillRect(rx0 + px, y0 + ry, 1, 1);
    }
  }
  // Ridge cap and eave shadow
  r(rx0, y0, rw, 3, shadeHex(b.roofDark, 1.2));
  r(rx0, y0 + 1, rw, 1, shadeHex(b.roof, 1.35));
  r(rx0, y0 + roofH - 3, rw, 3, shadeHex(b.roofDark, 0.7));
  r(rx0, y0 + roofH, rw, 2, "rgba(0,0,0,0.35)");

  /* ---- hanging sign ---- */
  const nameW = textWidth(b.sign);
  const subW = textWidth(b.signSub);
  const iconW = 12;
  const boardW = Math.max(nameW, subW) + iconW + SIGN_PAD * 3;
  const boardH = 7 + 3 + 7 + SIGN_PAD * 2;
  const bx = Math.round(x0 + w / 2 - boardW / 2);
  const by = Math.round(wallTop - 6);

  // Brackets into the wall
  r(bx + 6, by - 5, 2, 6, "#4a3527");
  r(bx + boardW - 8, by - 5, 2, 6, "#4a3527");
  // Board
  r(bx - 1, by - 1, boardW + 2, boardH + 2, "#3a291c");
  r(bx, by, boardW, boardH, "#7a5a3a");
  r(bx, by, boardW, 1, "#a17c52");
  r(bx, by + boardH - 2, boardW, 2, "#563c26");
  // Plank seam across the board
  r(bx, by + Math.floor(boardH / 2), boardW, 1, "rgba(0,0,0,0.16)");
  // Inner bevel
  r(bx + 2, by + 2, boardW - 4, boardH - 4, "rgba(0,0,0,0.12)");

  drawIcon(ctx, b.icon, bx + SIGN_PAD, by + SIGN_PAD + 2);
  drawText(
    ctx,
    b.sign,
    bx + SIGN_PAD * 2 + iconW,
    by + SIGN_PAD,
    "#f6ead2",
    "#2a1c11",
  );
  drawText(
    ctx,
    b.signSub,
    bx + SIGN_PAD * 2 + iconW,
    by + SIGN_PAD + 10,
    "#f0a878",
    "#2a1c11",
  );

  return { canvas: c, ox: OVERHANG, oy: TOP_MARGIN };
}

export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: Building,
  time: number,
) {
  let entry = buildingCache.get(b.id);
  if (!entry) {
    entry = makeBuilding(b);
    buildingCache.set(b.id, entry);
  }
  ctx.drawImage(entry.canvas, b.x * TILE - entry.ox, b.y * TILE - entry.oy);
  drawFlair(ctx, b, time);
}

/** The moving detail that makes each location feel inhabited. */
function drawFlair(ctx: CanvasRenderingContext2D, b: Building, time: number) {
  const x = b.x * TILE;
  const y = b.y * TILE;
  const w = b.w * TILE;
  const h = b.h * TILE;
  const roofH = Math.floor(h * 0.44);

  switch (b.flair) {
    case "smoke": {
      const cx = x + w - 26;
      ctx.fillStyle = "#4a4540";
      ctx.fillRect(cx, y - 20, 13, 24);
      ctx.fillStyle = "#5d5751";
      ctx.fillRect(cx + 1, y - 20, 5, 24);
      ctx.fillStyle = "#38332f";
      ctx.fillRect(cx - 2, y - 22, 17, 4);
      for (let i = 0; i < 6; i++) {
        const t = (time * 0.32 + i / 6) % 1;
        ctx.globalAlpha = (1 - t) * 0.42;
        const s = 3 + t * 9;
        ctx.fillStyle = "#d6dade";
        ctx.fillRect(
          cx + 3 - t * 13 + Math.sin(t * 6 + i) * 3,
          y - 26 - t * 40,
          s,
          s,
        );
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "lantern": {
      const flicker = 0.62 + Math.sin(time * 8.3) * 0.14 + Math.sin(time * 3.1) * 0.08;
      const lx = x - 14;
      const ly = y + h - 34;
      ctx.fillStyle = "#3a2b1e";
      ctx.fillRect(lx + 4, ly + 8, 3, 26);
      ctx.fillRect(lx + 1, ly + 32, 9, 3);
      ctx.globalAlpha = flicker * 0.35;
      ctx.fillStyle = "#f0c874";
      ctx.fillRect(lx - 6, ly - 4, 23, 22);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#4a3527";
      ctx.fillRect(lx, ly, 11, 11);
      ctx.fillStyle = `rgba(246,226,168,${flicker.toFixed(2)})`;
      ctx.fillRect(lx + 2, ly + 2, 7, 7);
      break;
    }
    case "forge": {
      const pulse = 0.5 + Math.sin(time * 3.4) * 0.28;
      const fx = x + w - 34;
      const fy = y + roofH + 30;
      ctx.globalAlpha = pulse * 0.5;
      ctx.fillStyle = "#ff8a3d";
      ctx.fillRect(fx - 6, fy - 6, 32, 24);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#2a1a12";
      ctx.fillRect(fx, fy, 20, 12);
      ctx.fillStyle = `rgba(255,150,70,${(0.6 + pulse * 0.4).toFixed(2)})`;
      ctx.fillRect(fx + 2, fy + 3, 16, 8);
      ctx.fillStyle = `rgba(255,224,150,${pulse.toFixed(2)})`;
      ctx.fillRect(fx + 6, fy + 5, 8, 4);
      for (let i = 0; i < 5; i++) {
        const t = (time * 0.7 + i * 0.2) % 1;
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = i % 2 ? "#ffb066" : "#ff7a3c";
        ctx.fillRect(fx + 3 + i * 4 + Math.sin(t * 8 + i) * 2, fy - t * 30, 2, 2);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "banner": {
      for (let i = 0; i < 3; i++) {
        const sway = Math.sin(time * 1.9 + i * 1.3) * 2;
        const bx = x + 16 + i * ((w - 40) / 2);
        ctx.fillStyle = "#4a3527";
        ctx.fillRect(bx - 1, y + 2, 12, 2);
        ctx.fillStyle = i % 2 ? "#e2542c" : "#efeae3";
        ctx.fillRect(bx, y + 4 + sway, 10, 16);
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.fillRect(bx, y + 4 + sway, 3, 16);
        // Pointed hem
        ctx.fillStyle = i % 2 ? "#e2542c" : "#efeae3";
        ctx.fillRect(bx + 2, y + 20 + sway, 6, 2);
        ctx.fillRect(bx + 4, y + 22 + sway, 2, 2);
      }
      break;
    }
    case "sparkle": {
      for (let i = 0; i < 5; i++) {
        const t = (time * 0.75 + i * 0.2) % 1;
        const a = Math.sin(t * Math.PI);
        if (a <= 0.02) continue;
        ctx.globalAlpha = a;
        ctx.fillStyle = i % 2 ? "#ffe9a8" : "#fff6d8";
        const sx = x + 14 + i * ((w - 28) / 4);
        const sy = y + roofH + 16 - t * 20;
        ctx.fillRect(sx, sy - 3, 1, 7);
        ctx.fillRect(sx - 3, sy, 7, 1);
        ctx.fillRect(sx - 1, sy - 1, 3, 3);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "mail": {
      const mx = x - 18;
      const my = y + h - 30;
      ctx.fillStyle = "#3a2b1e";
      ctx.fillRect(mx + 5, my + 10, 3, 20);
      ctx.fillRect(mx + 2, my + 28, 9, 2);
      ctx.fillStyle = "#35506b";
      ctx.fillRect(mx, my, 14, 11);
      ctx.fillStyle = "#4a6b8a";
      ctx.fillRect(mx, my + 2, 14, 8);
      ctx.fillStyle = "#2a3f56";
      ctx.fillRect(mx + 1, my + 5, 9, 3);
      ctx.fillStyle = "#e2542c";
      const flagY = my - 7 + Math.sin(time * 2.4) * 1;
      ctx.fillRect(mx + 13, flagY, 2, 10);
      ctx.fillRect(mx + 15, flagY, 4, 4);
      break;
    }
  }
}

/* -- scenery props -- */

const propCache = new Map<PropKind, HTMLCanvasElement>();

function makeProp(kind: PropKind): HTMLCanvasElement {
  const sizes: Record<PropKind, [number, number]> = {
    fountain: [48, 56],
    lamp: [16, 46],
    barrel: [16, 22],
    crate: [16, 18],
    pot: [16, 18],
    bench: [32, 22],
    stump: [16, 14],
    well: [32, 34],
  };
  const [w, h] = sizes[kind];
  const { c, ctx } = makeCanvas(w, h);
  if (!ctx) return c;

  const r = (x: number, y: number, rw: number, rh: number, col: string) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, rw, rh);
  };

  // Every prop gets a contact shadow, which is what seats it on the ground.
  r(2, h - 4, w - 4, 3, "rgba(0,0,0,0.22)");

  switch (kind) {
    case "fountain": {
      // Outer basin, drawn as courses of cut stone.
      for (let x = 1; x < 47; x++) {
        for (let y = 26; y < 52; y++) {
          const inset = Math.abs(x - 24) / 23;
          if (y > 46 && inset > 0.86) continue;
          const block = Math.floor((x + (y > 38 ? 5 : 0)) / 9);
          const joint = (x + (y > 38 ? 5 : 0)) % 9 === 0 || y === 38;
          const col = joint ? [78, 74, 68] : pick(STONE, hash2(block, y > 38 ? 1 : 0));
          const k = y > 46 ? 0.72 : 1;
          ctx.fillStyle = `rgb(${Math.round(col[0] * k)},${Math.round(
            col[1] * k,
          )},${Math.round(col[2] * k)})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      // Rim highlight and inner shadow
      r(1, 26, 46, 2, "#c2b8a6");
      r(1, 28, 46, 2, "rgba(0,0,0,0.28)");

      // Water surface
      for (let x = 4; x < 44; x++) {
        for (let y = 30; y < 44; y++) {
          const n = fbm(x * 0.3, y * 0.3);
          const c = pick(WATER, n * 0.7 + 0.15);
          ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      r(4, 30, 40, 2, "rgba(0,0,0,0.3)");

      // Central pedestal and upper bowl
      r(20, 14, 8, 18, "#8a8378");
      r(21, 14, 3, 18, "#a49c8e");
      r(20, 30, 8, 2, "#6e675e");
      r(14, 8, 20, 7, "#a49c8e");
      r(14, 8, 20, 2, "#c2b8a6");
      r(14, 13, 20, 2, "#6e675e");
      r(16, 10, 16, 3, "#3f8fb4");
      break;
    }
    case "lamp":
      r(5, h - 6, 6, 4, "#4a4540");
      r(4, h - 4, 8, 2, "#38332f");
      r(7, 10, 3, h - 14, "#38332f");
      r(7, 10, 1, h - 14, "#5d5751");
      r(4, 4, 9, 8, "#4a4540");
      r(5, 5, 7, 6, "#f0c874");
      r(6, 6, 3, 3, "#fff3cf");
      r(3, 2, 11, 3, "#38332f");
      r(6, 1, 5, 2, "#4a4540");
      break;
    case "barrel":
      r(2, 4, 12, 15, "#6b4a2a");
      r(3, 4, 10, 15, "#7d5834");
      r(4, 4, 4, 15, "#8f6740");
      r(2, 7, 12, 2, "#4a4540");
      r(2, 14, 12, 2, "#4a4540");
      r(2, 3, 12, 3, "#5b4029");
      r(3, 3, 10, 1, "#96754d");
      break;
    case "crate":
      r(2, 3, 12, 13, "#7a5a3a");
      r(3, 4, 10, 11, "#8f6b45");
      r(2, 3, 12, 2, "#5b4029");
      r(2, 14, 12, 2, "#5b4029");
      r(2, 3, 2, 13, "#5b4029");
      r(12, 3, 2, 13, "#5b4029");
      r(4, 6, 8, 1, "#a1804f");
      r(4, 10, 8, 1, "#6b5134");
      break;
    case "pot":
      r(4, 9, 8, 7, "#9c5b3c");
      r(3, 8, 10, 3, "#b06a46");
      r(4, 11, 3, 5, "#b8734d");
      r(6, 3, 2, 6, "#3f6b34");
      r(9, 4, 2, 5, "#3f6b34");
      r(5, 2, 3, 2, "#e0574a");
      r(9, 2, 3, 2, "#e8c04a");
      r(7, 0, 2, 3, "#d492c4");
      break;
    case "bench":
      r(3, 14, 3, 6, "#5b4029");
      r(26, 14, 3, 6, "#5b4029");
      r(1, 10, 30, 4, "#7a5a3a");
      r(1, 10, 30, 1, "#96754d");
      r(1, 4, 30, 3, "#7a5a3a");
      r(1, 4, 30, 1, "#96754d");
      r(2, 2, 2, 10, "#5b4029");
      r(28, 2, 2, 10, "#5b4029");
      break;
    case "stump":
      r(3, 4, 10, 8, "#4a3222");
      r(4, 3, 8, 8, "#6b4a2a");
      r(5, 4, 6, 4, "#8a6440");
      r(7, 5, 2, 2, "#5b4029");
      r(2, 9, 3, 3, "#4a3222");
      r(11, 9, 3, 3, "#4a3222");
      break;
    case "well": {
      // Stone ring
      for (let x = 2; x < 30; x++) {
        for (let y = 16; y < 30; y++) {
          const block = Math.floor((x + (y > 22 ? 4 : 0)) / 8);
          const joint = (x + (y > 22 ? 4 : 0)) % 8 === 0 || y === 22;
          const col = joint ? [70, 67, 62] : pick(STONE, hash2(block, y > 22 ? 1 : 0));
          ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      r(5, 16, 22, 4, "#1c2e3a"); // water inside
      r(7, 17, 12, 2, "#2f6b8f");
      // Posts and roof
      r(4, 2, 3, 15, "#5b4029");
      r(25, 2, 3, 15, "#5b4029");
      r(1, 0, 30, 4, "#8c4a3a");
      r(1, 0, 30, 1, "#a35944");
      r(3, 4, 26, 2, "#6d382c");
      // Bucket rope
      r(15, 6, 1, 6, "#a1804f");
      r(13, 11, 6, 5, "#6b4a2a");
      break;
    }
  }

  return c;
}

export const PROP_ANCHOR: Record<PropKind, { w: number; h: number }> = {
  fountain: { w: 48, h: 56 },
  lamp: { w: 16, h: 46 },
  barrel: { w: 16, h: 22 },
  crate: { w: 16, h: 18 },
  pot: { w: 16, h: 18 },
  bench: { w: 32, h: 22 },
  stump: { w: 16, h: 14 },
  well: { w: 32, h: 34 },
};

/** Tile depth of each prop's base, used to seat the sprite on the ground. */
const PROP_FOOT: Partial<Record<PropKind, number>> = {
  fountain: 3,
  well: 2,
};

export function drawProp(
  ctx: CanvasRenderingContext2D,
  kind: PropKind,
  tx: number,
  ty: number,
  time: number,
) {
  let sprite = propCache.get(kind);
  if (!sprite) {
    sprite = makeProp(kind);
    propCache.set(kind, sprite);
  }
  const size = PROP_ANCHOR[kind];
  // Anchored so the sprite's feet land on the bottom of its tile footprint.
  const footprintH = PROP_FOOT[kind] ?? 1;
  const ox = tx * TILE;
  const oy = (ty + footprintH) * TILE - size.h;
  ctx.drawImage(sprite, ox, oy);

  if (kind === "fountain") drawFountainWater(ctx, ox, oy, time);
}

/** The moving water, painted over the static basin each frame. */
function drawFountainWater(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  time: number,
) {
  // Jets arcing out of the upper bowl into the basin.
  for (let i = 0; i < 12; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const t = ((time * 0.9 + i * 0.083) % 1);
    const x = ox + 24 + side * (4 + t * 15);
    const y = oy + 13 + t * t * 20;
    ctx.fillStyle = i % 3 === 0 ? "#bfe6f4" : "#7cc2dd";
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }

  // Overflow lip
  ctx.fillStyle = "rgba(190,230,244,0.5)";
  ctx.fillRect(ox + 22, oy + 15, 4, 16);

  // Ripples on the basin surface
  for (let i = 0; i < 5; i++) {
    const phase = Math.sin(time * 1.8 + i * 1.7);
    if (phase < 0.2) continue;
    ctx.fillStyle = "rgba(200,238,250,0.42)";
    const rx = ox + 7 + i * 8;
    const ry = oy + 34 + ((i * 3) % 7);
    ctx.fillRect(rx, ry, 5 + Math.round(phase * 3), 1);
  }

  // Sparkle on the rim
  const glint = Math.sin(time * 2.4);
  if (glint > 0.7) {
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(ox + 12, oy + 27, 3, 1);
    ctx.fillRect(ox + 33, oy + 28, 2, 1);
  }
}

/* ----------------------------------------------------------------- colour */

function hexToRgb(hex: string): RGB {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function scale(c: RGB, k: number) {
  const f = (n: number) => Math.max(0, Math.min(255, Math.round(n * k)));
  return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`;
}

function shadeHex(hex: string, k: number) {
  return scale(hexToRgb(hex), k);
}
