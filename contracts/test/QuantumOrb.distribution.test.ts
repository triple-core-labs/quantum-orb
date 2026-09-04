import { expect } from "chai";
import { ethers } from "hardhat";

describe("QuantumOrb — rank distribution", () => {
  async function harness() {
    const Factory = await ethers.getContractFactory("RankHarness");
    const h = await Factory.deploy();
    await h.waitForDeployment();
    return h;
  }

  it("maps the exact band boundaries", async () => {
    const h = await harness();
    expect(await h.rank(0n)).to.equal(4);
    expect(await h.rank(19n)).to.equal(4);
    expect(await h.rank(20n)).to.equal(3);
    expect(await h.rank(799n)).to.equal(3);
    expect(await h.rank(800n)).to.equal(2);
    expect(await h.rank(2099n)).to.equal(2);
    expect(await h.rank(2100n)).to.equal(1);
    expect(await h.rank(9999n)).to.equal(1);
  });

  it("produces the configured probabilities across all 10000 rolls", async () => {
    const h = await harness();
    const tally = await h.countsByRank();

    expect(tally[0]).to.equal(7900n); // rank 1 — 79.00%
    expect(tally[1]).to.equal(1300n); // rank 2 — 13.00%
    expect(tally[2]).to.equal(780n); //  rank 3 —  7.80%
    expect(tally[3]).to.equal(20n); //   rank 4 —  0.20%

    const total = tally.reduce((a: bigint, b: bigint) => a + b, 0n);
    expect(total).to.equal(10000n);
  });
});
