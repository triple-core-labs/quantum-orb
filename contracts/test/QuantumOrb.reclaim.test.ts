import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_WINDOW } from "./helpers/chain";

const DAILY = 0;
const GENESIS = 1;
const ZERO = ethers.ZeroAddress;
const GENESIS_PRICE = ethers.parseEther("0.0015");

describe("QuantumOrb — reclaimOrb", () => {
  async function deploy() {
    await installMockBlast();
    const [owner, alice] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("QuantumOrb");
    const orb = await upgrades.deployProxy(Factory, [], {
      initializer: "initialize",
    });
    await orb.waitForDeployment();
    return { orb, owner, alice };
  }

  it("reverts while the reveal window is still open", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });
    await expect(
      orb.connect(alice).reclaimOrb(),
    ).to.be.revertedWithCustomError(orb, "RevealWindowOpen");
  });

  it("reverts when there is no pending open", async () => {
    const { orb, alice } = await deploy();
    await expect(
      orb.connect(alice).reclaimOrb(),
    ).to.be.revertedWithCustomError(orb, "NoPendingOpen");
  });

  it("refunds the exact price after the window closes", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });
    await mine(REVEAL_WINDOW + 1);

    await expect(orb.connect(alice).reclaimOrb()).to.changeEtherBalance(
      alice,
      GENESIS_PRICE,
    );
    expect((await orb.pending(alice.address)).exists).to.equal(false);
  });

  it("emits OrbExpired with the refunded amount", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });
    await mine(REVEAL_WINDOW + 1);

    await expect(orb.connect(alice).reclaimOrb())
      .to.emit(orb, "OrbExpired")
      .withArgs(alice.address, GENESIS, GENESIS_PRICE);
  });

  it("restores the daily cooldown so the attempt is not lost", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_WINDOW + 1);
    await orb.connect(alice).reclaimOrb();

    expect((await orb.users(alice.address)).lastDailyOpen).to.equal(0n);
    await expect(orb.connect(alice).openOrb(DAILY, ZERO)).to.emit(
      orb,
      "OrbCommitted",
    );
  });

  it("cannot be reclaimed twice", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });
    await mine(REVEAL_WINDOW + 1);
    await orb.connect(alice).reclaimOrb();

    await expect(
      orb.connect(alice).reclaimOrb(),
    ).to.be.revertedWithCustomError(orb, "NoPendingOpen");
  });
});
