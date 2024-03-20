/**
 * Opens one daily orb on the local node, so the full path can be watched:
 * commit -> relayer reveals -> indexer records -> API serves the points.
 *
 *   npx hardhat run scripts/play-local.ts --network localhost
 */
import { ethers } from "hardhat";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BACKEND_ENV = join(__dirname, "..", "..", "backend", ".env");
const DAILY = 0;

async function main() {
  const env = readFileSync(BACKEND_ENV, "utf8");
  const address = env.match(/^CONTRACT_ADDRESS=(0x[0-9a-fA-F]{40})$/m)?.[1];
  if (!address) throw new Error("CONTRACT_ADDRESS missing from backend/.env");

  const signers = await ethers.getSigners();
  const player = signers[1];
  const orb = await ethers.getContractAt("QuantumOrb", address, player);

  console.log("Player:  " + player.address);

  const tx = await orb.openOrb(DAILY, ethers.ZeroAddress);
  const receipt = await tx.wait();
  console.log("Committed in block " + receipt!.blockNumber);
  console.log("Waiting for the relayer to reveal...");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
