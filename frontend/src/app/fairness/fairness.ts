import { solidityPackedKeccak256 } from "ethers";

export const ROLL_SPACE = 10_000n;

export interface RankBands {
  rank4: bigint;
  rank3: bigint;
  rank2: bigint;
}

export interface Verification {
  seed: string;
  roll: number;
  rank: number;
  points: number;
}

export function seedFor(
  blockHash: string,
  user: string,
  commitBlock: number,
): string {
  return solidityPackedKeccak256(
    ["bytes32", "address", "uint64"],
    [blockHash, user, commitBlock],
  );
}

export function rankFor(seed: string, bands: RankBands): number {
  const roll = BigInt(seed) % ROLL_SPACE;
  if (roll < bands.rank4) return 4;
  if (roll < bands.rank3) return 3;
  if (roll < bands.rank2) return 2;
  return 1;
}

export function pointsFor(seed: string, min: number, max: number): number {
  const roll = BigInt(
    solidityPackedKeccak256(["uint256", "string"], [seed, "points"]),
  );
  const span = BigInt(max - min + 1);
  return Number(BigInt(min) + (roll % span));
}

export function verify(
  blockHash: string,
  user: string,
  commitBlock: number,
  bands: RankBands,
  ranges: { min: number[]; max: number[] },
): Verification {
  const seed = seedFor(blockHash, user, commitBlock);
  const roll = Number(BigInt(seed) % ROLL_SPACE);
  const rank = rankFor(seed, bands);
  const points = pointsFor(seed, ranges.min[rank - 1], ranges.max[rank - 1]);
  return { seed, roll, rank, points };
}
