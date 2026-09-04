import { ethers } from "hardhat";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BACKEND_ENV = join(__dirname, "..", "..", "backend", ".env");

const ORB_TYPES: Record<string, { id: number; price: string }> = {
  daily: { id: 0, price: "0" },
  genesis: { id: 1, price: "0.0015" },
  quantum: { id: 2, price: "0.0027" },
};

async function main() {
  const env = readFileSync(BACKEND_ENV, "utf8");
  const address = env.match(/^CONTRACT_ADDRESS=(0x[0-9a-fA-F]{40})$/m)?.[1];
  if (!address) throw new Error("CONTRACT_ADDRESS missing from backend/.env");

  const orbName = (process.env.ORB ?? "daily").toLowerCase();
  const orbType = ORB_TYPES[orbName];
  if (!orbType) {
    throw new Error(`Unknown orb "${orbName}". Use daily, genesis or quantum.`);
  }

  const signers = await ethers.getSigners();
  const player = signers[Number(process.env.PLAYER_INDEX ?? 1)];

  const referrerIndex = process.env.REFERRER_INDEX;
  const referrer =
    referrerIndex === undefined
      ? ethers.ZeroAddress
      : signers[Number(referrerIndex)].address;

  const orb = await ethers.getContractAt("QuantumOrb", address, player);

  console.log(`Player:   ${player.address}`);
  console.log(`Orb:      ${orbName} (${orbType.price} ETH)`);
  console.log(`Referrer: ${referrer}`);

  const tx = await orb.openOrb(orbType.id, referrer, {
    value: ethers.parseEther(orbType.price),
  });
  const receipt = await tx.wait();
  console.log(`Committed in block ${receipt!.blockNumber}`);
  console.log("Waiting for the relayer to reveal...");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
