import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_DELAY } from "./helpers/chain";

const GENESIS = 1;
const ZERO = ethers.ZeroAddress;
const GENESIS_PRICE = ethers.parseEther("0.0015");
const ROLL_SPACE = 10_000n;

function recomputeSeed(
  blockHash: string,
  user: string,
  commitBlock: bigint,
): string {
  return ethers.solidityPackedKeccak256(
    ["bytes32", "address", "uint64"],
    [blockHash, user, commitBlock],
  );
}

function recomputeRank(seed: string): number {
  const roll = BigInt(seed) % ROLL_SPACE;
  if (roll < 20n) return 4;
  if (roll < 800n) return 3;
  if (roll < 2100n) return 2;
  return 1;
}

function recomputePoints(seed: string, min: bigint, max: bigint): bigint {
  const roll = BigInt(
    ethers.solidityPackedKeccak256(["uint256", "string"], [seed, "points"]),
  );
  return min + (roll % (max - min + 1n));
}

describe("QuantumOrb — anyone can verify an outcome", () => {
  it("an independent recomputation matches the emitted result", async () => {
    await installMockBlast();
    const [, alice] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("QuantumOrb");
    const orb = await upgrades.deployProxy(Factory, [], {
      initializer: "initialize",
    });
    await orb.waitForDeployment();

    const commit = await orb
      .connect(alice)
      .openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });
    const commitReceipt = await commit.wait();
    const commitBlock = BigInt(commitReceipt!.blockNumber);

    await mine(REVEAL_DELAY);
    const reveal = await orb.revealOrb(alice.address);
    const revealReceipt = await reveal.wait();

    const opened = revealReceipt!.logs
      .map((log) => {
        try {
          return orb.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.name === "OrbOpened")!;

    const sourceBlock = await ethers.provider.getBlock(
      Number(commitBlock) + REVEAL_DELAY,
    );

    expect(opened.args["commitBlock"]).to.equal(commitBlock);

    const seed = recomputeSeed(
      sourceBlock!.hash!,
      alice.address,
      BigInt(opened.args["commitBlock"]),
    );
    const rank = recomputeRank(seed);

    const [min, max] = await orb.getOrbPoints(GENESIS);
    const points = recomputePoints(
      seed,
      BigInt(min[rank - 1]),
      BigInt(max[rank - 1]),
    );

    expect(rank).to.equal(Number(opened.args["rank"]));
    expect(points).to.equal(opened.args["points"]);
  });
});
