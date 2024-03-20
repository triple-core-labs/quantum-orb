// Config for the local development node only.
//
//   npx hardhat node --config hardhat.node.config.ts
//
// Blast produces a block every two seconds. The default automine mines one
// block per transaction, which never advances the chain while it is idle, so
// a committed orb would sit forever waiting for its reveal block. Interval
// mining reproduces the real cadence.
//
// The test suite keeps plain automine: deterministic one-block-per-transaction
// arithmetic is what makes the commit/reveal tests readable.
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
