import { ethers, network, upgrades } from "hardhat";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BACKEND_ENV = join(__dirname, "..", "..", "backend", ".env");

const RPC_FOR_CONTAINERS = "http://host.docker.internal:8545";

const BLAST_PRECOMPILE = "0x4300000000000000000000000000000000000002";

async function installMockBlast(): Promise<void> {
  if ((await ethers.provider.getCode(BLAST_PRECOMPILE)) !== "0x") return;

  const factory = await ethers.getContractFactory("MockBlast");
  const mock = await factory.deploy();
  await mock.waitForDeployment();

  const runtimeCode = await ethers.provider.getCode(await mock.getAddress());
  await network.provider.send("hardhat_setCode", [
    BLAST_PRECOMPILE,
    runtimeCode,
  ]);
  console.log("Installed MockBlast at the Blast precompile address");
}

function setEnv(contents: string, key: string, value: string): string {
  const line = key + "=" + value;
  const pattern = new RegExp("^" + key + "=.*$", "m");
  return pattern.test(contents)
    ? contents.replace(pattern, line)
    : contents.trimEnd() + "\n" + line + "\n";
}

function relayerAddress(env: string): string | null {
  const match = env.match(/^RELAYER_PRIVATE_KEY=(0x[0-9a-fA-F]{64})$/m);
  return match ? new ethers.Wallet(match[1]).address : null;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from " + deployer.address);

  await installMockBlast();

  const Factory = await ethers.getContractFactory("QuantumOrb");
  const orb = await upgrades.deployProxy(Factory, [], {
    initializer: "initialize",
  });
  await orb.waitForDeployment();

  const address = await orb.getAddress();
  const startBlock = await ethers.provider.getBlockNumber();
  console.log("QuantumOrb proxy: " + address);
  console.log("Start block:      " + startBlock);

  let env = readFileSync(BACKEND_ENV, "utf8");

  const relayer = relayerAddress(env);
  if (relayer) {
    const tx = await deployer.sendTransaction({
      to: relayer,
      value: ethers.parseEther("100"),
    });
    await tx.wait();
    const balance = await ethers.provider.getBalance(relayer);
    console.log(
      "Funded relayer " + relayer + " with " + ethers.formatEther(balance) + " ETH",
    );
  } else {
    console.warn("No RELAYER_PRIVATE_KEY in backend/.env; relayer not funded.");
  }

  env = setEnv(env, "CONTRACT_ADDRESS", address);
  env = setEnv(env, "CONTRACT_START_BLOCK", String(startBlock));
  env = setEnv(env, "CHAIN_ID", "31337");
  env = setEnv(env, "RPC_URL", RPC_FOR_CONTAINERS);
  writeFileSync(BACKEND_ENV, env);

  console.log("");
  console.log("backend/.env updated. Restart the stack against it with:");
  console.log("  docker compose up -d --force-recreate");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
