import { ethers, upgrades } from 'hardhat';

async function main(): Promise<void> {
    const qoFactory = await ethers.getContractFactory('QuantumOrb');
    console.log('Deploying QuantumOrb...');
    const qo = await upgrades.upgradeProxy('0x9c94e5D2F4024F74B591d806A7C7D64abB901f0c', qoFactory);
    console.log('QuantumOrb deployed to:', await qo.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
