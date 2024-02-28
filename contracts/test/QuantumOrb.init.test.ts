import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { installMockBlast } from "./helpers/blast";

describe("QuantumOrb — initialisation", () => {
  async function deploy() {
    await installMockBlast();
    const [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("QuantumOrb");
    const orb = await upgrades.deployProxy(Factory, [], {
      initializer: "initialize",
    });
    await orb.waitForDeployment();
    return { orb, owner, other };
  }

  it("sets the deployer as owner", async () => {
    const { orb, owner } = await deploy();
    expect(await orb.owner()).to.equal(owner.address);
  });

  it("cannot be initialised twice", async () => {
    const { orb } = await deploy();
    await expect(orb.initialize()).to.be.revertedWithCustomError(
      orb,
      "InvalidInitialization",
    );
  });

  it("seeds the three orb configs with their prices", async () => {
    const { orb } = await deploy();
    expect((await orb.orbConfig(0)).price).to.equal(0n);
    expect((await orb.orbConfig(1)).price).to.equal(
      ethers.parseEther("0.0015"),
    );
    expect((await orb.orbConfig(2)).price).to.equal(
      ethers.parseEther("0.0027"),
    );
  });

  it("seeds GENESIS rank-4 points as 3501..9999", async () => {
    const { orb } = await deploy();
    const [min, max] = await orb.getOrbPoints(1);
    expect(min[3]).to.equal(3501n);
    expect(max[3]).to.equal(9999n);
  });

  it("exposes the reveal timing constants", async () => {
    const { orb } = await deploy();
    expect(await orb.REVEAL_DELAY()).to.equal(2n);
    expect(await orb.REVEAL_WINDOW()).to.equal(250n);
  });

  it("rejects setOrbConfig from a non-owner", async () => {
    const { orb, other } = await deploy();
    await expect(
      orb.connect(other).setOrbConfig(1, 1n, true, [1, 2, 3, 4], [5, 6, 7, 8]),
    ).to.be.revertedWithCustomError(orb, "OwnableUnauthorizedAccount");
  });

  it("rejects a config whose min exceeds its max", async () => {
    const { orb } = await deploy();
    await expect(
      orb.setOrbConfig(1, 1n, true, [10, 2, 3, 4], [5, 6, 7, 8]),
    ).to.be.revertedWithCustomError(orb, "InvalidPointsRange");
  });

  it("emits OrbConfigChanged on a valid update", async () => {
    const { orb } = await deploy();
    await expect(orb.setOrbConfig(1, 7n, false, [1, 2, 3, 4], [5, 6, 7, 8]))
      .to.emit(orb, "OrbConfigChanged")
      .withArgs(1, 7n, false);
  });
});
