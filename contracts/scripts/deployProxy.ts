import { ethers, upgrades } from 'hardhat';

async function main(): Promise<void> {
    const qoFactory = await ethers.getContractFactory('QuantumOrb');
    const qo = await upgrades.deployProxy(qoFactory, [], { initializer: 'initialize' });
    await qo.waitForDeployment();

    console.log("Contract deployed to address:", await qo.getAddress());
}

main();