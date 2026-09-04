import { artifacts } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  const artifact = await artifacts.readArtifact("QuantumOrb");
  const outDir = join(__dirname, "..", "abi");
  mkdirSync(outDir, { recursive: true });

  writeFileSync(
    join(outDir, "QuantumOrb.json"),
    JSON.stringify({ abi: artifact.abi }, null, 2) + "\n",
  );

  console.log(`Wrote ${artifact.abi.length} ABI entries to contracts/abi/`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
