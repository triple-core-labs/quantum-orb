import { ethers } from "hardhat";
import { JsonRpcProvider, Wallet } from "ethers";
import dotenv from "dotenv";

import QuantumOrbABI from "./QuantumOrbABI.json";

dotenv.config();

const contractAddress = process.env.CONTRACT_ADDRESS;

const privateKey = `0x${process.env.PRIVATE_KEY}`;

// Derive the user's address from the private key
const wallet = new Wallet(privateKey);

const provider = new JsonRpcProvider(process.env.RPC_PROVIDER);
const walletConnected = wallet.connect(provider);
const QuantumOrb = new ethers.Contract(contractAddress, QuantumOrbABI.abi, walletConnected);

async function initializeUser(parentAddress: string) {
    const transaction = await QuantumOrb.initializeUser(parentAddress);
    await transaction.wait();
}

async function markAsPartner(userAddress: string) {
    const transaction = await QuantumOrb.markAsPartner(userAddress);
    await transaction.wait();
}

async function openDailyOrb() {
    const points = await QuantumOrb.openDailyOrb();
    return points;
}

async function openGenesisOrb() {
    const points = await QuantumOrb.openGenesisOrb({ value: ethers.utils.parseEther("0.0015") });
    return points;
}

async function openQuantumOrb() {
    const points = await QuantumOrb.openQuantumOrb({ value: ethers.utils.parseEther("0.0027") });
    return points;
}

async function getPoints(userAddress: string) {
    const points = await QuantumOrb.getPoints(userAddress);
    return points;
}

async function getReferralPoints(userAddress: string) {
    const points = await QuantumOrb.getReferralPoints(userAddress);
    return points;
}

async function getUserX(userAddress: string) {
    const xLink = await QuantumOrb.getUserX(userAddress);
    return xLink;
}

async function getUserParent(userAddress: string) {
    const parentAddress = await QuantumOrb.getUserParent(userAddress);
    return parentAddress;
}

async function getUserPartnerStatus(userAddress: string) {
    const isPartner = await QuantumOrb.getUserPartnerStatus(userAddress);
    return isPartner;
}

async function getUserLastOpenedDaily(userAddress: string) {
    const lastOpenedDaily = await QuantumOrb.getUserLastOpenedDaily(userAddress);
    return lastOpenedDaily;
}

async function main() {
    const userAddress = wallet.address;

    // Get points
    const points = await getPoints(userAddress);
    console.log("User points:", points.toString());

    // Get partner status
    const isPartner = await getUserPartnerStatus(userAddress);
    console.log("User is partner:", isPartner);

    // Get X link
    const xLink = await getUserX(userAddress);
    console.log("User X link:", xLink);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
