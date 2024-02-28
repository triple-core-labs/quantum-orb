import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_DELAY } from "./helpers/chain";

const DAILY = 0;
const GENESIS = 1;
const ZERO = ethers.ZeroAddress;
const GENESIS_PRICE = ethers.parseEther("0.0015");

describe("QuantumOrb — openOrb", () => {
  async function deploy() {
    await installMockBlast();
    const [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("QuantumOrb");
    const orb = await upgrades.deployProxy(Factory, [], {
      initializer: "initialize",
    });
    await orb.waitForDeployment();
    return { orb, owner, alice, bob };
  }

  it("records a pending open and emits OrbCommitted", async () => {
    const { orb, alice } = await deploy();
    const tx = await orb.connect(alice).openOrb(DAILY, ZERO);
    const receipt = await tx.wait();

    await expect(tx)
      .to.emit(orb, "OrbCommitted")
      .withArgs(alice.address, DAILY, receipt!.blockNumber);

    const p = await orb.pending(alice.address);
    expect(p.exists).to.equal(true);
    expect(p.orbType).to.equal(DAILY);
    expect(p.commitBlock).to.equal(BigInt(receipt!.blockNumber));
  });

  it("registers the user on first open", async () => {
    const { orb, alice } = await deploy();
    await expect(orb.connect(alice).openOrb(DAILY, ZERO))
      .to.emit(orb, "UserRegistered")
      .withArgs(alice.address, ZERO);
    expect((await orb.users(alice.address)).registered).to.equal(true);
  });

  it("rejects a second open while one is pending", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await expect(
      orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE }),
    ).to.be.revertedWithCustomError(orb, "OpenAlreadyPending");
  });

  it("rejects DAILY again within 24 hours", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(alice.address);

    await expect(
      orb.connect(alice).openOrb(DAILY, ZERO),
    ).to.be.revertedWithCustomError(orb, "DailyNotReady");
  });

  it("allows DAILY again after 24 hours", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(alice.address);

    await time.increase(24 * 60 * 60);
    await expect(orb.connect(alice).openOrb(DAILY, ZERO)).to.emit(
      orb,
      "OrbCommitted",
    );
  });

  it("rejects payment sent with a DAILY orb", async () => {
    const { orb, alice } = await deploy();
    await expect(
      orb.connect(alice).openOrb(DAILY, ZERO, { value: 1n }),
    ).to.be.revertedWithCustomError(orb, "IncorrectPayment");
  });

  it("rejects underpayment and overpayment for GENESIS", async () => {
    const { orb, alice } = await deploy();
    await expect(
      orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE - 1n }),
    ).to.be.revertedWithCustomError(orb, "IncorrectPayment");
    await expect(
      orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE + 1n }),
    ).to.be.revertedWithCustomError(orb, "IncorrectPayment");
  });

  it("rejects opening a disabled orb", async () => {
    const { orb, alice } = await deploy();
    await orb.setOrbConfig(GENESIS, GENESIS_PRICE, false, [1, 2, 3, 4], [5, 6, 7, 8]);
    await expect(
      orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE }),
    ).to.be.revertedWithCustomError(orb, "OrbDisabled");
  });

  it("rejects opening while paused", async () => {
    const { orb, alice } = await deploy();
    await orb.pause();
    await expect(
      orb.connect(alice).openOrb(DAILY, ZERO),
    ).to.be.revertedWithCustomError(orb, "EnforcedPause");
  });
});
