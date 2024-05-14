const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const target = join(__dirname, "..", "src", "environments", "environment.ts");

const fromEnv = (name) => {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? undefined : value.trim();
};

const apiBaseUrl = fromEnv("API_BASE_URL");
if (!apiBaseUrl) {
  console.error("API_BASE_URL must be set before building for production");
  process.exit(1);
}

try {
  new URL(apiBaseUrl);
} catch {
  console.error(`API_BASE_URL is not a URL: ${apiBaseUrl}`);
  process.exit(1);
}

const current = readFileSync(target, "utf8");
const fallback = (name, pattern) => {
  const found = current.match(pattern);
  if (!found) {
    console.error(`${target} no longer declares ${name}`);
    process.exit(1);
  }
  return found[1];
};

const chainId = fromEnv("CHAIN_ID") ?? fallback("chainId", /chainId: (\d+)/);
const chainName =
  fromEnv("CHAIN_NAME") ?? fallback("chainName", /chainName: "(.*)"/);
const rpcUrl = fromEnv("RPC_URL") ?? fallback("rpcUrl", /rpcUrl: "(.*)"/);
const explorer =
  fromEnv("BLOCK_EXPLORER_URL") ??
  fallback("blockExplorerUrl", /blockExplorerUrl: "(.*)"/);

writeFileSync(
  target,
  `export const environment = {
  production: true,
  apiBaseUrl: "${apiBaseUrl.replace(/\/$/, "")}",
  chainId: ${Number(chainId)},
  chainName: "${chainName}",
  rpcUrl: "${rpcUrl}",
  blockExplorerUrl: "${explorer}",
};
`,
);

console.log(`Production environment points at ${apiBaseUrl}`);
