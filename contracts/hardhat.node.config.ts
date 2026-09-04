import base from "./hardhat.config";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  ...base,
  networks: {
    ...base.networks,
    hardhat: {
      chainId: 31337,
      mining: { auto: true, interval: 2000 },
    },
  },
};

export default config;
