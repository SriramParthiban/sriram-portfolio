import {
  Building,
  MAP_H,
  MAP_W,
  TILE,
  Terrain,
  hash,
  terrainAt,
} from "./world";

export const PAL = {
  grass: "#4a7a3a",
  grassLight: "#578d43",
  grassDark: "#3d6630",
  flowerA: "#e0574a",
  flowerB: "#e8c04a",
  flowerC: "#d492c4",
  path: "#a8845c",
  pathDark: "#8f6e4a",
  plaza: "#9a9186",
  plazaJoint: "#7d746a",
  water: "#2f6b8f",
  waterDeep: "#23526d",
  waterLight: "#57a3c4",
  sand: "#c9b183",
  trunk: "#5a3f2b",
  trunkDark: "#422d1f",
  leaf: "#2f5c2c",
  leafLight: "#3d7038",
  leafDark: "#23461f",
  bush: "#35662f",
  bushLight: "#438038",
  rock: "#7d7a75",
  rockDark: "#5c5955",
  fence: "#8a6a45",
  fenceDark: "#6b5134",
  shadow: "rgba(0,0,0,0.22)",
  door: "#3a2a20",
  window: "#f0c874",
} as const;

/* ------------------------------------------------------------------ ground */

function drawGround(ctx: CanvasRenderingContext2D, t: Terrain, tx: number, ty: number) {
  const x = tx * TILE;
  const y = ty * TILE;
  const h = hash(tx, ty);
  const h2 = hash(tx + 91, ty + 17);

  switch (t) {
    case Terrain.Water: {
      ctx.fillStyle = PAL.water;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = PAL.waterDeep;
      if (h > 0.5) ctx.fillRect(x + 2, y + 6, 9, 3);
      break;
    }
    case Terrain.Sand: {
      ctx.fillStyle = PAL.sand;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = "rgba(0,0,0,0.07)";
      if (h > 0.6) ctx.fillRect(x + 4, y + 9, 3, 2);
      break;
    }
    case Terrain.Path: {
      ctx.fillStyle = PAL.path;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = PAL.pathDark;
      if (h > 0.45) ctx.fillRect(x + 3, y + 4, 3, 2);
      if (h2 > 0.7) ctx.fillRect(x + 9, y + 10, 2, 2);
      break;
    }
    case Terrain.Plaza: {
      ctx.fillStyle = PAL.plaza;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = PAL.plazaJoint;
      ctx.fillRect(x, y + 15, TILE, 1);
      ctx.fillRect(x + (ty % 2 === 0 ? 15 : 7), y, 1, TILE);
      break;
    }
    default: {
      // Grass underlies flowers, bushes, rocks and fences.
      ctx.fillStyle = PAL.grass;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = h > 0.5 ? PAL.grassLight : PAL.grassDark;
      ctx.fillRect(x + 2 + Math.floor(h * 8), y + 3 + Math.floor(h2 * 8), 2, 1);
      ctx.fillRect(x + 9 - Math.floor(h2 * 6), y + 11 - Math.floor(h * 5), 2, 1);
    }
  }

  if (t === Terrain.Flowers) {
    const colors = [PAL.flowerA, PAL.flowerB, PAL.flowerC];
    ctx.fillStyle = colors[Math.floor(h * 3) % 3];
    ctx.fillRect(x + 4, y + 6, 2, 2);
    ctx.fillStyle = colors[Math.floor(h2 * 3) % 3];
    ctx.fillRect(x + 10, y + 11, 2, 2);
  }

  if (t === Terrain.Bush) {
    ctx.fillStyle = PAL.bush;
    ctx.fillRect(x + 2, y + 5, 12, 9);
    ctx.fillRect(x + 4, y + 3, 8, 3);
    ctx.fillStyle = PAL.bushLight;
    ctx.fillRect(x + 4, y + 6, 4, 3);
  }

  if (t === Terrain.Rock) {
    ctx.fillStyle = PAL.rockDark;
    ctx.fillRect(x + 3, y + 6, 10, 7);
    ctx.fillStyle = PAL.rock;
    ctx.fillRect(x + 4, y + 5, 8, 5);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(x + 5, y + 6, 3, 2);
  }

  if (t === Terrain.Fence) {
    ctx.fillStyle = PAL.fenceDark;
    ctx.fillRect(x + 2, y + 4, 3, 11);
    ctx.fillRect(x + 11, y + 4, 3, 11);
    ctx.fillStyle = PAL.fence;
    ctx.fillRect(x, y + 6, TILE, 2);
    ctx.fillRect(x, y + 11, TILE, 2);
  }
}

/**
 * The static ground is drawn once into an offscreen canvas and blitted each
 * frame. Redrawing ~1500 tiles per frame with this many fillRects would not
 * hold 60fps on a phone.
 */
export function buildGroundCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = MAP_W * TILE;
  canvas.height = MAP_H * TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;

  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const t = terrainAt(tx, ty);
      // Trees are sprites, not ground — draw grass beneath them instead.
      drawGround(ctx, t === Terrain.Tree ? Terrain.Grass : t, tx, ty);
    }
  }
  return canvas;
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
  const phase = Math.sin(time * 1.6 + tx * 0.8 + ty * 0.5);
  if (phase < 0.35) return;
  ctx.fillStyle = PAL.waterLight;
  ctx.fillRect(x + 3 + (phase > 0.75 ? 2 : 0), y + 5, 6, 1);
  if (phase > 0.8) ctx.fillRect(x + 8, y + 10, 4, 1);
}

/* ------------------------------------------------------------------- trees */

/** Trees are ~2.5 tiles tall so the player can pass behind the canopy. */
export function drawTree(ctx: CanvasRenderingContext2D, tx: number, ty: number) {
  const x = tx * TILE;
  const y = ty * TILE;
  const h = hash(tx, ty);
  const lift = h > 0.6 ? 4 : 0;

  ctx.fillStyle = PAL.shadow;
  ctx.fillRect(x + 3, y + 13, 10, 3);

  ctx.fillStyle = PAL.trunkDark;
  ctx.fillRect(x + 6, y - 2, 5, 17);
  ctx.fillStyle = PAL.trunk;
  ctx.fillRect(x + 6, y - 2, 2, 17);

  const cy = y - 20 - lift;
  ctx.fillStyle = PAL.leafDark;
  ctx.fillRect(x - 4, cy + 6, 24, 12);
  ctx.fillRect(x - 1, cy, 18, 20);
  ctx.fillStyle = PAL.leaf;
  ctx.fillRect(x - 2, cy + 4, 20, 11);
  ctx.fillRect(x + 1, cy + 1, 14, 17);
  ctx.fillStyle = PAL.leafLight;
  ctx.fillRect(x + 1, cy + 4, 7, 5);
  ctx.fillRect(x + 4, cy + 2, 4, 3);
}

/* --------------------------------------------------------------- buildings */

export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: Building,
  time: number,
) {
  const x = b.x * TILE;
  const y = b.y * TILE;
  const w = b.w * TILE;
  const h = b.h * TILE;
  const roofH = Math.floor(h * 0.52);

  // Ground shadow
  ctx.fillStyle = PAL.shadow;
  ctx.fillRect(x + 2, y + h - 4, w - 4, 6);

  // Walls
  ctx.fillStyle = b.wall;
  ctx.fillRect(x, y + roofH, w, h - roofH);
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.fillRect(x, y + h - 5, w, 5);

  // Plank texture
  ctx.fillStyle = "rgba(0,0,0,0.09)";
  for (let i = y + roofH + 5; i < y + h - 5; i += 6) {
    ctx.fillRect(x + 2, i, w - 4, 1);
  }

  // Roof — overhangs the walls, with an eave shadow underneath.
  ctx.fillStyle = b.roofDark;
  ctx.fillRect(x - 4, y, w + 8, roofH);
  ctx.fillStyle = b.roof;
  for (let i = 0; i < roofH - 3; i += 5) {
    ctx.fillRect(x - 4 + (i % 10 === 0 ? 0 : 2), y + i, w + 8, 4);
  }
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(x - 4, y + roofH - 3, w + 8, 3);

  // Windows
  const winY = y + roofH + 8;
  const glow = 0.72 + Math.sin(time * 1.4 + b.x) * 0.12;
  for (let i = 0; i < 2; i++) {
    const wx = x + 8 + i * (w - 30);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(wx - 1, winY - 1, 16, 14);
    ctx.fillStyle = PAL.window;
    ctx.globalAlpha = glow;
    ctx.fillRect(wx, winY, 14, 12);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(wx + 6, winY, 2, 12);
    ctx.fillRect(wx, winY + 5, 14, 2);
  }

  // Door, aligned to the warp tile
  const dx = b.doorX * TILE;
  const dy = y + h - 22;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(dx - 2, dy - 2, TILE + 4, 24);
  ctx.fillStyle = PAL.door;
  ctx.fillRect(dx, dy, TILE, 22);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(dx + 2, dy + 2, 3, 18);
  ctx.fillStyle = PAL.window;
  ctx.fillRect(dx + 11, dy + 11, 2, 2);

  drawFlair(ctx, b, time);
}

/** The detail that makes each location feel like its own place. */
function drawFlair(ctx: CanvasRenderingContext2D, b: Building, time: number) {
  const x = b.x * TILE;
  const y = b.y * TILE;
  const w = b.w * TILE;

  switch (b.flair) {
    case "smoke": {
      // Chimney with rising puffs
      ctx.fillStyle = b.roofDark;
      ctx.fillRect(x + w - 26, y - 14, 12, 18);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(x + w - 26, y - 14, 12, 3);
      for (let i = 0; i < 4; i++) {
        const t = (time * 0.5 + i * 0.25) % 1;
        ctx.globalAlpha = (1 - t) * 0.5;
        const s = 3 + t * 7;
        ctx.fillStyle = "#cfd4d8";
        ctx.fillRect(x + w - 22 - t * 9, y - 18 - t * 30, s, s);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "lantern": {
      const flicker = 0.65 + Math.sin(time * 7) * 0.18;
      const lx = x - 10;
      const ly = y + 34;
      ctx.fillStyle = PAL.trunkDark;
      ctx.fillRect(lx + 3, ly, 3, 22);
      ctx.fillStyle = "rgba(240,200,116," + flicker.toFixed(2) + ")";
      ctx.fillRect(lx - 4, ly - 10, 16, 14);
      ctx.fillStyle = "#f6e2a8";
      ctx.fillRect(lx, ly - 6, 8, 7);
      break;
    }
    case "forge": {
      // Glowing forge mouth pulsing under the eaves
      const pulse = 0.55 + Math.sin(time * 3.2) * 0.3;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "#ff8a3d";
      ctx.fillRect(x + w - 30, y + 46, 20, 12);
      ctx.globalAlpha = pulse * 0.5;
      ctx.fillStyle = "#ffd08a";
      ctx.fillRect(x + w - 26, y + 49, 12, 6);
      ctx.globalAlpha = 1;
      // Ember specks
      for (let i = 0; i < 3; i++) {
        const t = (time * 0.8 + i * 0.33) % 1;
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = "#ffb066";
        ctx.fillRect(x + w - 22 + i * 4, y + 46 - t * 22, 2, 2);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "banner": {
      for (let i = 0; i < 3; i++) {
        const sway = Math.sin(time * 2 + i) * 2;
        ctx.fillStyle = i % 2 ? "#e2542c" : "#efeae3";
        ctx.fillRect(x + 14 + i * 26, y + 4 + sway, 10, 18);
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(x + 14 + i * 26, y + 20 + sway, 10, 2);
      }
      break;
    }
    case "sparkle": {
      for (let i = 0; i < 4; i++) {
        const t = (time * 0.9 + i * 0.25) % 1;
        ctx.globalAlpha = Math.sin(t * Math.PI);
        ctx.fillStyle = "#ffe9a8";
        const sx = x + 12 + i * 18;
        const sy = y + 30 - t * 16;
        ctx.fillRect(sx, sy, 2, 2);
        ctx.fillRect(sx - 2, sy + 2, 6, 1);
        ctx.fillRect(sx, sy - 2, 2, 6);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case "mail": {
      // Mailbox beside the door with its flag up
      const mx = x - 14;
      const my = y + 46;
      ctx.fillStyle = PAL.trunkDark;
      ctx.fillRect(mx + 4, my + 10, 3, 14);
      ctx.fillStyle = "#4a6b8a";
      ctx.fillRect(mx, my, 12, 10);
      ctx.fillStyle = "#35506b";
      ctx.fillRect(mx, my, 12, 3);
      ctx.fillStyle = "#e2542c";
      ctx.fillRect(mx + 12, my - 6 + Math.sin(time * 3) * 1, 2, 9);
      break;
    }
  }
}
