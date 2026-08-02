/**
 * World definition. Terrain is generated from feature rectangles rather than a
 * hand-typed tile string — a 48x32 string is 1536 characters that all have to
 * line up, and one miscount silently shifts the whole map.
 */

export const TILE = 16;
export const MAP_W = 48;
export const MAP_H = 32;

// A plain const object rather than `const enum` so the file is erasable
// TypeScript — that lets Node run it directly for the map sanity check.
export const Terrain = {
  Grass: 0,
  Flowers: 1,
  Path: 2,
  Plaza: 3,
  Water: 4,
  Sand: 5,
  Tree: 6,
  Bush: 7,
  Rock: 8,
  Fence: 9,
} as const;

export type Terrain = (typeof Terrain)[keyof typeof Terrain];

export type LocationId =
  | "archive"
  | "workshop"
  | "foundry"
  | "gallery"
  | "trophy"
  | "post";

export type Building = {
  id: LocationId;
  name: string;
  sub: string;
  /** Tile coords of the top-left of the footprint. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Door tile, in tile coords. Standing on it warps inside. */
  doorX: number;
  doorY: number;
  wall: string;
  roof: string;
  roofDark: string;
  /** Ambient flourish drawn for this building only. */
  flair: "smoke" | "lantern" | "forge" | "banner" | "sparkle" | "mail";
};

export const buildings: Building[] = [
  {
    id: "archive",
    name: "The Archive",
    sub: "About & Education",
    x: 6,
    y: 4,
    w: 7,
    h: 5,
    doorX: 9,
    doorY: 9,
    wall: "#6b5344",
    roof: "#8c4a3a",
    roofDark: "#6d382c",
    flair: "lantern",
  },
  {
    id: "workshop",
    name: "The Workshop",
    sub: "Experience",
    x: 20,
    y: 3,
    w: 8,
    h: 5,
    doorX: 23,
    doorY: 8,
    wall: "#5d5a55",
    roof: "#41545f",
    roofDark: "#31414a",
    flair: "smoke",
  },
  {
    id: "foundry",
    name: "The Foundry",
    sub: "Capabilities",
    x: 35,
    y: 5,
    w: 7,
    h: 5,
    doorX: 38,
    doorY: 10,
    wall: "#5a4c48",
    roof: "#7a3f2c",
    roofDark: "#5c2f21",
    flair: "forge",
  },
  {
    id: "gallery",
    name: "The Gallery",
    sub: "Projects",
    x: 5,
    y: 18,
    w: 8,
    h: 5,
    doorX: 8,
    doorY: 23,
    wall: "#6a6154",
    roof: "#4d5b43",
    roofDark: "#3a4633",
    flair: "banner",
  },
  {
    id: "trophy",
    name: "Trophy Hall",
    sub: "Certifications",
    x: 19,
    y: 19,
    w: 6,
    h: 4,
    doorX: 21,
    doorY: 23,
    wall: "#6d6250",
    roof: "#8a6a34",
    roofDark: "#6b5127",
    flair: "sparkle",
  },
  {
    id: "post",
    name: "Post Office",
    sub: "Contact",
    x: 33,
    y: 18,
    w: 6,
    h: 4,
    doorX: 35,
    doorY: 22,
    wall: "#67564c",
    roof: "#8d5340",
    roofDark: "#6d3f31",
    flair: "mail",
  },
];

type Rect = { x: number; y: number; w: number; h: number };

const rects = (list: Rect[]) => list;

/** Walkable stone plaza at the centre of the valley. */
const plaza: Rect = { x: 18, y: 11, w: 12, h: 6 };

/** Paths connecting every door to the plaza. */
const paths = rects([
  // Plaza spine, east-west
  { x: 4, y: 13, w: 40, h: 2 },
  // Plaza spine, north-south
  { x: 23, y: 8, w: 2, h: 18 },
  // Up to Archive door
  { x: 9, y: 9, w: 2, h: 5 },
  // Up to Foundry door
  { x: 38, y: 10, w: 2, h: 4 },
  // Down to Gallery door
  { x: 8, y: 15, w: 2, h: 9 },
  // Down to Trophy Hall door
  { x: 21, y: 15, w: 2, h: 9 },
  // Down to Post Office door
  { x: 35, y: 15, w: 2, h: 8 },
  // Southern path toward the pond
  { x: 24, y: 25, w: 14, h: 2 },
]);

const forests = rects([
  { x: 0, y: 0, w: MAP_W, h: 3 },
  { x: 0, y: 0, w: 4, h: MAP_H },
  { x: MAP_W - 4, y: 0, w: 4, h: MAP_H },
  { x: 0, y: MAP_H - 3, w: MAP_W, h: 3 },
  { x: 14, y: 4, w: 4, h: 6 },
  { x: 29, y: 4, w: 4, h: 5 },
  { x: 14, y: 19, w: 3, h: 6 },
  { x: 27, y: 19, w: 4, h: 5 },
]);

const meadows = rects([
  { x: 5, y: 11, w: 8, h: 2 },
  { x: 32, y: 12, w: 6, h: 2 },
  { x: 10, y: 26, w: 8, h: 3 },
]);

/** Pond, as a centre plus radii so the shore reads as a curve. */
const pond = { cx: 40, cy: 26, rx: 6, ry: 4 };

const inRect = (x: number, y: number, r: Rect) =>
  x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

/** Deterministic per-tile noise — Math.random would differ every render. */
export function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function ellipse(x: number, y: number, e: typeof pond, grow = 0) {
  const dx = (x - e.cx) / (e.rx + grow);
  const dy = (y - e.cy) / (e.ry + grow);
  return dx * dx + dy * dy <= 1;
}

export const terrain: Terrain[] = (() => {
  const out = new Array<Terrain>(MAP_W * MAP_H).fill(Terrain.Grass);

  const set = (x: number, y: number, t: Terrain) => {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
    out[y * MAP_W + x] = t;
  };

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const h = hash(x, y);

      // Forest first, thinned at the edges so the border isn't a solid wall.
      if (forests.some((r) => inRect(x, y, r))) {
        set(x, y, h > 0.22 ? Terrain.Tree : h > 0.12 ? Terrain.Bush : Terrain.Grass);
      }

      if (meadows.some((r) => inRect(x, y, r)) && h > 0.45) {
        set(x, y, Terrain.Flowers);
      }

      // Scattered rocks on open grass.
      if (out[y * MAP_W + x] === Terrain.Grass && h > 0.965) {
        set(x, y, Terrain.Rock);
      }

      // Pond with a sand shore.
      if (ellipse(x, y, pond, 1)) set(x, y, Terrain.Sand);
      if (ellipse(x, y, pond)) set(x, y, Terrain.Water);
    }
  }

  // Paths and plaza carve through everything above.
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (paths.some((r) => inRect(x, y, r))) set(x, y, Terrain.Path);
      if (inRect(x, y, plaza)) set(x, y, Terrain.Plaza);
    }
  }

  // A fence around the meadow south-west, purely for texture.
  for (let x = 10; x < 18; x++) set(x, 29, Terrain.Fence);

  return out;
})();

export const terrainAt = (x: number, y: number): Terrain => {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return Terrain.Tree;
  return terrain[y * MAP_W + x];
};

const SOLID = new Set<Terrain>([
  Terrain.Tree,
  Terrain.Water,
  Terrain.Rock,
  Terrain.Bush,
  Terrain.Fence,
]);

/** Collision grid: terrain plus building footprints, minus doorways. */
export const solid: boolean[] = (() => {
  const out = new Array<boolean>(MAP_W * MAP_H).fill(false);

  for (let i = 0; i < terrain.length; i++) out[i] = SOLID.has(terrain[i]);

  for (const b of buildings) {
    for (let y = b.y; y < b.y + b.h; y++) {
      for (let x = b.x; x < b.x + b.w; x++) {
        if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) out[y * MAP_W + x] = true;
      }
    }
    // The door sits on the row below the footprint and must stay walkable.
    out[b.doorY * MAP_W + b.doorX] = false;
  }

  return out;
})();

export const isSolid = (x: number, y: number) => {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  return solid[y * MAP_W + x];
};

/** Which building's door, if any, covers this tile. */
export function doorAt(tx: number, ty: number): Building | null {
  for (const b of buildings) {
    if (b.doorX === tx && b.doorY === ty) return b;
  }
  return null;
}

/** Player spawn, in world pixels — middle of the plaza. */
export const SPAWN = {
  x: (plaza.x + plaza.w / 2) * TILE,
  y: (plaza.y + plaza.h / 2) * TILE,
};

/** Named regions, shown in the HUD as you walk around. */
export const regions: { name: string; r: Rect }[] = [
  { name: "Town Plaza", r: plaza },
  { name: "Still Pond", r: { x: 33, y: 21, w: 14, h: 10 } },
  { name: "North Road", r: { x: 4, y: 3, w: 40, h: 8 } },
  { name: "South Meadow", r: { x: 4, y: 17, w: 40, h: 12 } },
];

export function regionAt(tx: number, ty: number) {
  for (const region of regions) {
    if (inRect(tx, ty, region.r)) return region.name;
  }
  return "Pelican Trail";
}
