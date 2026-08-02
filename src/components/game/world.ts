/**
 * World definition. Terrain is generated from feature shapes rather than a
 * hand-typed tile string — a 48x32 string is 1536 characters that all have to
 * line up, and one miscount silently shifts the whole map.
 *
 * The valley is a hub and spoke: a round plaza with a fountain at its centre,
 * and six roads leading out, one to each building.
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

export type IconKind =
  | "book"
  | "gear"
  | "anvil"
  | "frame"
  | "trophy"
  | "mail";

export type Point = { x: number; y: number };

export type Building = {
  id: LocationId;
  name: string;
  sub: string;
  /** Short name for the hanging sign — long strings overflow the board. */
  sign: string;
  /** What the visitor will find inside, second line of the sign. */
  signSub: string;
  icon: IconKind;
  /** Tile coords of the top-left of the footprint. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Door tile. Standing on it warps inside. Always the row below the roof. */
  doorX: number;
  doorY: number;
  wall: string;
  roof: string;
  roofDark: string;
  /** Ambient flourish drawn for this building only. */
  flair: "smoke" | "lantern" | "forge" | "banner" | "sparkle" | "mail";
  /**
   * The road from the plaza to this door, as waypoints. Southern buildings
   * need the road to wrap around them — their doors face away from the hub.
   */
  road: Point[];
};

/** Centre of the plaza, and the point every road radiates from. */
export const HUB = { x: 24, y: 16 };
const PLAZA_R = 6.4;

export const buildings: Building[] = [
  {
    id: "archive",
    name: "The Archive",
    sub: "About & Education",
    sign: "ARCHIVE",
    signSub: "WHO I AM",
    icon: "book",
    x: 11,
    y: 5,
    w: 7,
    h: 5,
    doorX: 14,
    doorY: 10,
    wall: "#a97b4d",
    roof: "#c04a30",
    roofDark: "#8e3220",
    flair: "lantern",
    road: [
      { x: 24, y: 16 },
      { x: 18, y: 12 },
      { x: 14, y: 12 },
      { x: 14, y: 10 },
    ],
  },
  {
    id: "workshop",
    name: "The Workshop",
    sub: "Experience",
    sign: "WORKSHOP",
    signSub: "EXPERIENCE",
    icon: "gear",
    x: 30,
    y: 5,
    w: 8,
    h: 5,
    doorX: 33,
    doorY: 10,
    wall: "#9c8b72",
    roof: "#3f7f96",
    roofDark: "#2b5c6e",
    flair: "smoke",
    road: [
      { x: 24, y: 16 },
      { x: 30, y: 12 },
      { x: 33, y: 12 },
      { x: 33, y: 10 },
    ],
  },
  {
    id: "gallery",
    name: "The Gallery",
    sub: "Projects",
    sign: "GALLERY",
    signSub: "PROJECTS",
    icon: "frame",
    x: 5,
    y: 15,
    w: 8,
    h: 5,
    doorX: 8,
    doorY: 20,
    wall: "#b09a72",
    roof: "#5c8c3e",
    roofDark: "#3f6828",
    flair: "banner",
    road: [
      { x: 24, y: 16 },
      { x: 18, y: 16 },
      { x: 14, y: 21 },
      { x: 8, y: 21 },
      { x: 8, y: 20 },
    ],
  },
  {
    id: "foundry",
    name: "The Foundry",
    sub: "Capabilities",
    sign: "FOUNDRY",
    signSub: "SKILLS",
    icon: "anvil",
    x: 36,
    y: 15,
    w: 7,
    h: 5,
    doorX: 39,
    doorY: 20,
    wall: "#8f6f52",
    roof: "#a8442a",
    roofDark: "#7b2d19",
    flair: "forge",
    road: [
      { x: 24, y: 16 },
      { x: 30, y: 16 },
      { x: 34, y: 21 },
      { x: 39, y: 21 },
      { x: 39, y: 20 },
    ],
  },
  {
    id: "trophy",
    name: "Trophy Hall",
    sub: "Certifications",
    sign: "TROPHY HALL",
    signSub: "CERTIFICATIONS",
    icon: "trophy",
    x: 13,
    y: 22,
    w: 6,
    h: 4,
    doorX: 15,
    doorY: 26,
    wall: "#a9906a",
    roof: "#d09a2e",
    roofDark: "#a06f1c",
    flair: "sparkle",
    road: [
      { x: 24, y: 16 },
      { x: 20, y: 21 },
      { x: 20, y: 27 },
      { x: 15, y: 27 },
      { x: 15, y: 26 },
    ],
  },
  {
    id: "post",
    name: "Post Office",
    sub: "Contact",
    sign: "POST OFFICE",
    signSub: "CONTACT",
    icon: "mail",
    x: 29,
    y: 22,
    w: 6,
    h: 4,
    doorX: 31,
    doorY: 26,
    wall: "#9a7f66",
    roof: "#c25f3c",
    roofDark: "#924024",
    flair: "mail",
    road: [
      { x: 24, y: 16 },
      { x: 27, y: 21 },
      { x: 27, y: 27 },
      { x: 31, y: 27 },
      { x: 31, y: 26 },
    ],
  },
];

type Rect = { x: number; y: number; w: number; h: number };

const forests: Rect[] = [
  { x: 0, y: 0, w: MAP_W, h: 3 },
  { x: 0, y: 0, w: 4, h: MAP_H },
  { x: MAP_W - 4, y: 0, w: 4, h: MAP_H },
  { x: 0, y: MAP_H - 3, w: MAP_W, h: 3 },
  { x: 4, y: 4, w: 6, h: 7 },
  { x: 20, y: 3, w: 4, h: 5 },
  { x: 39, y: 4, w: 5, h: 7 },
  { x: 4, y: 23, w: 7, h: 5 },
  { x: 22, y: 22, w: 4, h: 4 },
  { x: 42, y: 12, w: 3, h: 8 },
];

const meadows: Rect[] = [
  { x: 18, y: 8, w: 5, h: 3 },
  { x: 31, y: 13, w: 4, h: 2 },
  { x: 9, y: 12, w: 6, h: 2 },
  { x: 21, y: 28, w: 9, h: 2 },
  { x: 34, y: 12, w: 3, h: 2 },
];

/** Pond, tucked into the south-east away from every road. */
const pond = { cx: 41, cy: 27, rx: 4, ry: 3 };

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

const distToHub = (x: number, y: number) =>
  Math.hypot(x - HUB.x, y - HUB.y);

/* --------------------------------------------------------------- scenery */

export type PropKind =
  | "fountain"
  | "lamp"
  | "barrel"
  | "crate"
  | "pot"
  | "bench"
  | "stump"
  | "well";

export type Prop = { kind: PropKind; x: number; y: number };

/**
 * Placed by hand. All of these collide, so the reachability check has to run
 * after any change here.
 */
export const props: Prop[] = [
  // The fountain sits dead centre; the plaza ring flows around it.
  { kind: "fountain", x: 23, y: 15 },

  // Plaza ring: lamps between the road mouths, benches facing the water.
  { kind: "lamp", x: 20, y: 13 },
  { kind: "lamp", x: 28, y: 13 },
  { kind: "lamp", x: 20, y: 19 },
  { kind: "lamp", x: 28, y: 19 },
  { kind: "bench", x: 22, y: 19 },
  { kind: "bench", x: 25, y: 12 },

  // Archive garden
  { kind: "pot", x: 10, y: 10 },
  { kind: "pot", x: 18, y: 10 },
  { kind: "lamp", x: 12, y: 12 },

  // Workshop yard
  { kind: "crate", x: 29, y: 9 },
  { kind: "barrel", x: 38, y: 9 },
  { kind: "crate", x: 38, y: 8 },

  // Gallery frontage
  { kind: "lamp", x: 4, y: 21 },
  { kind: "pot", x: 12, y: 20 },
  { kind: "bench", x: 11, y: 23 },

  // Foundry yard
  { kind: "barrel", x: 35, y: 20 },
  { kind: "barrel", x: 43, y: 20 },
  { kind: "stump", x: 35, y: 14 },

  // Trophy Hall
  { kind: "lamp", x: 12, y: 27 },
  { kind: "pot", x: 19, y: 26 },

  // Post Office
  { kind: "crate", x: 26, y: 27 },
  { kind: "lamp", x: 35, y: 26 },
  { kind: "well", x: 34, y: 17 },

  // Pond side
  { kind: "stump", x: 36, y: 24 },
];

/** Footprint of each prop in tiles, for collision. */
export const PROP_SIZE: Record<PropKind, { w: number; h: number }> = {
  fountain: { w: 3, h: 3 },
  lamp: { w: 1, h: 1 },
  barrel: { w: 1, h: 1 },
  crate: { w: 1, h: 1 },
  pot: { w: 1, h: 1 },
  bench: { w: 2, h: 1 },
  stump: { w: 1, h: 1 },
  well: { w: 2, h: 2 },
};

/* --------------------------------------------------------------- terrain */

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

      if (meadows.some((r) => inRect(x, y, r)) && h > 0.4) {
        set(x, y, Terrain.Flowers);
      }

      if (out[y * MAP_W + x] === Terrain.Grass && h > 0.972) {
        set(x, y, Terrain.Rock);
      }

      if (ellipse(x, y, pond, 1)) set(x, y, Terrain.Sand);
      if (ellipse(x, y, pond)) set(x, y, Terrain.Water);
    }
  }

  // Roads carve through everything above. A 2x2 brush along each segment
  // gives a two-tile road, wide enough to walk without feeling like a corridor.
  const brush = (x: number, y: number) => {
    set(x, y, Terrain.Path);
    set(x + 1, y, Terrain.Path);
    set(x, y + 1, Terrain.Path);
    set(x + 1, y + 1, Terrain.Path);
  };

  const segment = (a: Point, b: Point) => {
    const steps = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    if (steps === 0) {
      brush(a.x, a.y);
      return;
    }
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      brush(Math.round(a.x + (b.x - a.x) * t), Math.round(a.y + (b.y - a.y) * t));
    }
  };

  for (const b of buildings) {
    for (let i = 0; i < b.road.length - 1; i++) {
      segment(b.road[i], b.road[i + 1]);
    }
  }

  // The round plaza goes on top of the road ends, so the hub reads as one
  // paved circle with six roads leaving it.
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (distToHub(x, y) <= PLAZA_R) set(x, y, Terrain.Plaza);
    }
  }

  // A fence line along the south meadow, purely for texture.
  for (let x = 21; x < 30; x++) set(x, 30, Terrain.Fence);

  // Clear small obstacles touching a walkway. A rock or bush half a tile off
  // the path is invisible from a distance and just feels like being blocked
  // by nothing. Trees stay — they read clearly as something to walk around.
  const walkable = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
    const t = out[y * MAP_W + x];
    return t === Terrain.Path || t === Terrain.Plaza;
  };

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = out[y * MAP_W + x];
      if (t !== Terrain.Rock && t !== Terrain.Bush) continue;
      let touching = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (walkable(x + dx, y + dy)) touching = true;
        }
      }
      if (touching) set(x, y, Terrain.Grass);
    }
  }

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

/** Collision grid: terrain plus building and prop footprints, minus doorways. */
export const solid: boolean[] = (() => {
  const out = new Array<boolean>(MAP_W * MAP_H).fill(false);

  for (let i = 0; i < terrain.length; i++) out[i] = SOLID.has(terrain[i]);

  const fill = (x0: number, y0: number, w: number, h: number) => {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) out[y * MAP_W + x] = true;
      }
    }
  };

  for (const b of buildings) {
    fill(b.x, b.y, b.w, b.h);
    // The door sits on the row below the footprint and must stay walkable.
    out[b.doorY * MAP_W + b.doorX] = false;
  }

  for (const p of props) {
    const size = PROP_SIZE[p.kind];
    fill(p.x, p.y, size.w, size.h);
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

/** Player spawn, in world pixels — on the plaza, just south of the fountain. */
export const SPAWN = {
  x: HUB.x * TILE + TILE / 2,
  y: (HUB.y + 4) * TILE + TILE - 2,
};

/** Named regions, shown in the HUD as you walk around. */
export const regions: { name: string; r: Rect }[] = [
  { name: "Fountain Square", r: { x: 18, y: 10, w: 13, h: 13 } },
  { name: "North Road", r: { x: 4, y: 3, w: 40, h: 7 } },
  { name: "Still Pond", r: { x: 34, y: 23, w: 13, h: 8 } },
  { name: "West Green", r: { x: 4, y: 10, w: 14, h: 11 } },
  { name: "East Green", r: { x: 31, y: 10, w: 13, h: 11 } },
  { name: "South Meadow", r: { x: 4, y: 21, w: 30, h: 10 } },
];

export function regionAt(tx: number, ty: number) {
  for (const region of regions) {
    if (inRect(tx, ty, region.r)) return region.name;
  }
  return "Pelican Trail";
}
