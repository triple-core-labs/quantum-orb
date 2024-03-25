const { readFileSync, writeFileSync, mkdirSync } = require("node:fs");
const { join, dirname } = require("node:path");

const source = join(__dirname, "..", "..", "contracts", "abi", "QuantumOrb.json");
const target = join(
  __dirname,
  "..",
  "src",
  "app",
  "contract",
  "quantum-orb.abi.json",
);

const { abi } = JSON.parse(readFileSync(source, "utf8"));

const required = ["OrbCommitted", "OrbOpened", "OrbExpired", "PointsCredited"];
const declared = new Set(
  abi.filter((e) => e.type === "event").map((e) => e.name),
);
const missing = required.filter((name) => !declared.has(name));
if (missing.length) {
  console.error(`Contract ABI is missing events: ${missing.join(", ")}`);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(abi, null, 2) + "\n");
console.log(`Synced ${abi.length} ABI entries`);
