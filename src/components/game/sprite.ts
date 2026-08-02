/**
 * The character, drawn from pixel-aligned rectangles rather than a bitmap.
 * Stardew's farmer is 16x32 — a tile and a half tall — so the head overlaps
 * the tile above and the world reads as having depth. Same proportions here.
 */

export type Dir = "down" | "up" | "left" | "right";

const C = {
  hair: "#3a2a22",
  hairLight: "#4d382c",
  skin: "#e8b98c",
  skinShade: "#cf9d73",
  shirt: "#e2542c",
  shirtShade: "#b8401f",
  pants: "#3c4a63",
  boot: "#4a3729",
  eye: "#22303f",
  outline: "rgba(0,0,0,0.28)",
} as const;

export const SPRITE_W = 16;
export const SPRITE_H = 24;

type Frame = { legLift: [number, number]; bob: number; armSwing: number };

// Four-frame cycle: contact, pass, contact, pass — legs opposite on 1 and 3.
const FRAMES: Frame[] = [
  { legLift: [0, 0], bob: 0, armSwing: 0 },
  { legLift: [2, 0], bob: -1, armSwing: 1 },
  { legLift: [0, 0], bob: 0, armSwing: 0 },
  { legLift: [0, 2], bob: -1, armSwing: -1 },
];

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
  const f = moving ? FRAMES[frameIndex % 4] : FRAMES[0];
  // Idle breathing keeps the character alive when standing still.
  const idle = moving ? 0 : Math.sin(time * 2.4) > 0.6 ? 1 : 0;

  const ox = Math.round(x) - SPRITE_W / 2;
  const oy = Math.round(y) - SPRITE_H + f.bob + idle;

  const r = (rx: number, ry: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox + rx, oy + ry, rw, rh);
  };

  // Contact shadow, always on the ground plane
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(Math.round(x) - 6, Math.round(y) - 3, 12, 4);

  const flip = dir === "left";
  if (flip) {
    ctx.save();
    ctx.translate(Math.round(x) * 2, 0);
    ctx.scale(-1, 1);
  }

  const side = dir === "left" || dir === "right";

  // --- legs + boots ---
  const [liftA, liftB] = f.legLift;
  if (side) {
    r(5, 19 - liftA, 3, 4 + liftA, C.pants);
    r(8, 19 - liftB, 3, 4 + liftB, C.pants);
    r(5, 22, 4, 2, C.boot);
    r(8, 22, 4, 2, C.boot);
  } else {
    r(4, 19 - liftA, 3, 4 + liftA, C.pants);
    r(9, 19 - liftB, 3, 4 + liftB, C.pants);
    r(4, 22, 3, 2, C.boot);
    r(9, 22, 3, 2, C.boot);
  }

  // --- torso ---
  if (side) {
    r(5, 12, 7, 8, C.shirt);
    r(5, 12, 2, 8, C.shirtShade);
  } else {
    r(4, 12, 8, 8, C.shirt);
    r(4, 17, 8, 3, C.shirtShade);
  }

  // --- arms ---
  const swing = f.armSwing;
  if (side) {
    r(7, 13 + swing, 3, 6, C.skin);
  } else {
    r(2, 13 + swing, 2, 6, C.skin);
    r(12, 13 - swing, 2, 6, C.skin);
  }

  // --- head ---
  if (dir === "up") {
    // Back of the head: all hair, no face.
    r(3, 1, 10, 11, C.hair);
    r(4, 1, 8, 3, C.hairLight);
  } else if (side) {
    r(4, 1, 9, 8, C.hair);
    r(6, 4, 7, 8, C.skin);
    r(6, 10, 7, 2, C.skinShade);
    r(4, 1, 6, 6, C.hair);
    r(10, 7, 2, 2, C.eye);
  } else {
    r(3, 1, 10, 8, C.hair);
    r(4, 4, 8, 8, C.skin);
    r(4, 10, 8, 2, C.skinShade);
    r(3, 1, 10, 4, C.hair);
    r(3, 4, 2, 3, C.hair);
    r(11, 4, 2, 3, C.hair);
    r(5, 7, 2, 2, C.eye);
    r(9, 7, 2, 2, C.eye);
  }

  if (flip) ctx.restore();
}
