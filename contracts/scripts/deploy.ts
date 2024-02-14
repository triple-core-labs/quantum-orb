import { ethers } from 'hardhat';

async function main(): Promise<void> {
    const [deployer] = await ethers.getSigners();

    const qoFactory = await ethers.getContractFactory("QuantumOrb", deployer);
    const qo = await qoFactory.deploy();
    await qo.waitForDeployment();

    console.log("Contract deployed to address:", await qo.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error: Error) => {
        console.error(error);
        process.exit(1);
    });