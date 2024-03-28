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
