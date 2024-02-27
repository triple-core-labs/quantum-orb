import { ethers, network } from "hardhat";

export const BLAST_PRECOMPILE =
  "0x4300000000000000000000000000000000000002";

/**
 * Installs MockBlast's runtime bytecode at the Blast precompile address so
 * QuantumOrb.initialize() can call it on the Hardhat network.
 */
export async function installMockBlast(): Promise<void> {
  const factory = await ethers.getContractFactory("MockBlast");
  const mock = await factory.deploy();
  await mock.waitForDeployment();

  const runtimeCode = await ethers.provider.getCode(await mock.getAddress());
  await network.provider.send("hardhat_setCode", [
    BLAST_PRECOMPILE,
    runtimeCode,
  ]);
}
