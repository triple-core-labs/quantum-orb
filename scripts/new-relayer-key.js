// Generates a throwaway relayer key straight into backend/.env.
// The private key is never printed: only the address, which you need in order
// to fund the wallet from a Blast Sepolia faucet.
//
//   node scripts/new-relayer-key.js
//
// Testnet only. Rotate before this touches anything of value.
const { ethers } = require("../contracts/node_modules/ethers");
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const envPath = join(__dirname, "..", "backend", ".env");
if (!existsSync(envPath)) {
  console.error("backend/.env not found. Copy backend/.env.example first.");
  process.exit(1);
}

const contents = readFileSync(envPath, "utf8");

if (/^RELAYER_PRIVATE_KEY=.+$/m.test(contents)) {
  console.error(
    "RELAYER_PRIVATE_KEY is already set. Blank it first if you mean to rotate.",
  );
  process.exit(1);
}

const wallet = ethers.Wallet.createRandom();

writeFileSync(
  envPath,
  contents.replace(
    /^RELAYER_PRIVATE_KEY=.*$/m,
    `RELAYER_PRIVATE_KEY=${wallet.privateKey}`,
  ),
);

console.log("Relayer wallet created and written to backend/.env");
console.log(`Address: ${wallet.address}`);
console.log("");
console.log("Fund it from a Blast Sepolia faucet before starting the relayer.");
