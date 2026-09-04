import { network } from "hardhat";

export const REVEAL_DELAY = 2;
export const REVEAL_WINDOW = 250;

export async function mine(n: number): Promise<void> {
  for (let i = 0; i < n; i++) {
    await network.provider.send("evm_mine");
  }
}
