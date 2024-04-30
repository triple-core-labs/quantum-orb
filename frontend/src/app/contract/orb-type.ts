export enum OrbType {
  DAILY = 0,
  GENESIS = 1,
  QUANTUM = 2,
}

export const ORB_LABELS: Record<OrbType, string> = {
  [OrbType.DAILY]: "Daily",
  [OrbType.GENESIS]: "Genesis",
  [OrbType.QUANTUM]: "Quantum",
};

export const ORB_SLUGS: Record<OrbType, string> = {
  [OrbType.DAILY]: "daily",
  [OrbType.GENESIS]: "genesis",
  [OrbType.QUANTUM]: "quantum",
};

export interface Rarity {
  name: string;
  slug: string;
}

export const RARITIES: Record<number, Rarity> = {
  1: { name: "Common", slug: "common" },
  2: { name: "Rare", slug: "rare" },
  3: { name: "Epic", slug: "epic" },
  4: { name: "Legendary", slug: "legendary" },
};

export function rarityOf(rank: number): Rarity {
  return RARITIES[rank] ?? RARITIES[1];
}
