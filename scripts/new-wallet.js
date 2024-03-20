// Generates a throwaway wallet straight into an .env file.
// The private key is never printed: only the address, which is what you need
// in order to fund the wallet.
//
//   node scripts/new-wallet.js relayer    -> RELAYER_PRIVATE_KEY  in backend/.env
//   node scripts/new-wallet.js deployer   -> DEPLOYER_PRIVATE_KEY in contracts/.env
//
// Testnet only. Rotate before either touches anything of value.
const { ethers } = require("../contracts/node_modules/ethers");
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const TARGETS = {
  relayer: { envFile: "backend/.env", key: "RELAYER_PRIVATE_KEY" },
  deployer: { envFile: "contracts/.env", key: "DEPLOYER_PRIVATE_KEY" },
};

const target = TARGETS[process.argv[2]];
if (!target) {
  console.error(
    `Usage: node scripts/new-wallet.js <${Object.keys(TARGETS).join("|")}>`,
  );
  process.exit(1);
}

const envPath = join(__dirname, "..", target.envFile);
if (!existsSync(envPath)) {
  console.error(
    `${target.envFile} not found. Copy the .env.example beside it first.`,
  );
  process.exit(1);
}

const contents = readFileSync(envPath, "utf8");
const assigned = new RegExp(`^${target.key}=.+$`, "m");
const placeholder = new RegExp(`^${target.key}=.*$`, "m");

if (assigned.test(contents)) {
  console.error(
    `${target.key} is already set. Blank it first if you mean to rotate.`,
  );
  process.exit(1);
}
if (!placeholder.test(contents)) {
  console.error(`${target.key} is not present in ${target.envFile}.`);
  process.exit(1);
}

const wallet = ethers.Wallet.createRandom();
writeFileSync(
  envPath,
  contents.replace(placeholder, `${target.key}=${wallet.privateKey}`),
);

console.log(`Wallet created and written to ${target.envFile}`);
console.log(`Address: ${wallet.address}`);
