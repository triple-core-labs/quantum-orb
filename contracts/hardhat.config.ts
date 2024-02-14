import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    sourcify: {
        enabled: true
    },
    etherscan: {
        apiKey: {
            blast_sepolia: "blast_sepolia", // apiKey is not required, just set a placeholder
        },
        customChains: [
            {
                network: "blast_sepolia",
                chainId: 168587773,
                urls: {
                    apiURL: "https://api.routescan.io/v2/network/testnet/evm/168587773/etherscan",
                    browserURL: "https://testnet.blastscan.io"
                }
            }
        ]
    },
    networks: {
        blast_sepolia: {
            url: 'https://rpc.ankr.com/blast_testnet_sepolia',
            accounts: [`0x${process.env.PRIVATE_KEY}`]
        },
    },
};

export default config;