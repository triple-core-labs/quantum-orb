import { ethers, upgrades, network } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  if (!deployer) {
    throw new Error("No signer. Set DEPLOYER_PRIVATE_KEY in contracts/.env.");
  }

  console.log(`Deploying to ${network.name} as ${deployer.address}`);

  const Factory = await ethers.getContractFactory("QuantumOrb");
  const orb = await upgrades.deployProxy(Factory, [], {
    initializer: "initialize",
  });
  await orb.waitForDeployment();

  const address = await orb.getAddress();
  const block = await ethers.provider.getBlockNumber();

  console.log(`QuantumOrb proxy: ${address}`);
  console.log(`Start block:      ${block}`);
  console.log("");
  console.log("Set these in the backend environment:");
  console.log(`  CONTRACT_ADDRESS=${address}`);
  console.log(`  CONTRACT_START_BLOCK=${block}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
