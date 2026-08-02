export type Station = {
  id: string;
  index: string;
  label: string;
  hint: string;
  href: string;
};

export const stations: Station[] = [
  {
    id: "about",
    index: "01",
    label: "About",
    hint: "Who I am",
    href: "#about",
  },
  {
    id: "capabilities",
    index: "02",
    label: "Capabilities",
    hint: "What I do",
    href: "#capabilities",
  },
  {
    id: "work",
    index: "03",
    label: "Experience",
    hint: "Where I've shipped",
    href: "#work",
  },
  {
    id: "projects",
    index: "04",
    label: "Projects",
    hint: "What I built",
    href: "#projects",
  },
  {
    id: "contact",
    index: "05",
    label: "Contact",
    hint: "Say hello",
    href: "#contact",
  },
];

/** Layout of the world, in world pixels. */
export const WORLD = {
  edge: 520,
  spacing: 780,
  startX: 190,
  /** How close the character must be for a door to become enterable. */
  reach: 130,
  speed: 470,
};

export const stationX = (i: number) => WORLD.edge + i * WORLD.spacing;

export const worldWidth =
  stationX(stations.length - 1) + WORLD.edge;
