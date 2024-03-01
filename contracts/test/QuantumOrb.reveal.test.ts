import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_DELAY, REVEAL_WINDOW } from "./helpers/chain";

const DAILY = 0;
const GENESIS = 1;
const ZERO = ethers.ZeroAddress;
const GENESIS_PRICE = ethers.parseEther("0.0015");
const REASON_SELF = 0;
const REASON_REFERRAL = 1;

describe("QuantumOrb — revealOrb", () => {
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

  function creditedEvents(orb: any, receipt: any) {
    return receipt.logs
      .map((l: any) => {
        try {
          return orb.interface.parseLog(l);
        } catch {
          return null;
        }
      })
      .filter((l: any) => l?.name === "PointsCredited");
  }

  it("reverts before the reveal delay", async () => {
    const { orb, alice } = await deploy();
    // Automine puts this reveal in commitBlock + 1, one short of the guard.
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await expect(orb.revealOrb(alice.address)).to.be.revertedWithCustomError(
      orb,
      "RevealTooEarly",
    );
  });

  it("reverts in the delay block itself, where blockhash is zero", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY - 1); // reveal lands exactly in commitBlock + 2
    await expect(orb.revealOrb(alice.address)).to.be.revertedWithCustomError(
      orb,
      "RevealTooEarly",
    );
  });

  it("reverts when there is no pending open", async () => {
    const { orb, alice } = await deploy();
    await expect(orb.revealOrb(alice.address)).to.be.revertedWithCustomError(
      orb,
      "NoPendingOpen",
    );
  });

  it("reverts after the reveal window closes", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_WINDOW + 1);
    await expect(orb.revealOrb(alice.address)).to.be.revertedWithCustomError(
      orb,
      "RevealWindowClosed",
    );
  });

  it("credits points inside the configured DAILY range", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(alice.address);

    const points = (await orb.users(alice.address)).points;
    expect(points).to.be.greaterThanOrEqual(25n);
    expect(points).to.be.lessThanOrEqual(501n);
    expect((await orb.pending(alice.address)).exists).to.equal(false);
  });

  it("emits OrbOpened and one PointsCredited without a referrer", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);

    const tx = await orb.revealOrb(alice.address);
    await expect(tx).to.emit(orb, "OrbOpened");

    const receipt = await tx.wait();
    const credited = creditedEvents(orb, receipt);

    expect(credited.length).to.equal(1);
    expect(credited[0]!.args.reason).to.equal(REASON_SELF);
  });

  it("credits the referrer 10% and emits a second PointsCredited", async () => {
    const { orb, alice, bob } = await deploy();
    await orb.connect(bob).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(bob.address);

    await orb
      .connect(alice)
      .openOrb(GENESIS, bob.address, { value: GENESIS_PRICE });
    await mine(REVEAL_DELAY);
    const tx = await orb.revealOrb(alice.address);
    const receipt = await tx.wait();

    const alicePoints = (await orb.users(alice.address)).points;
    const expectedBonus = alicePoints / 10n;

    expect((await orb.users(bob.address)).referralPoints).to.equal(
      expectedBonus,
    );

    const credited = creditedEvents(orb, receipt);
    expect(credited.length).to.equal(2);
    expect(credited[1]!.args.user).to.equal(bob.address);
    expect(credited[1]!.args.reason).to.equal(REASON_REFERRAL);
  });

  it("doubles the referral bonus for a partner", async () => {
    const { orb, alice, bob } = await deploy();
    await orb.setPartner(bob.address, true);
    await orb.connect(bob).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(bob.address);

    await orb
      .connect(alice)
      .openOrb(GENESIS, bob.address, { value: GENESIS_PRICE });
    await mine(REVEAL_DELAY);
    await orb.revealOrb(alice.address);

    const alicePoints = (await orb.users(alice.address)).points;
    expect((await orb.users(bob.address)).referralPoints).to.equal(
      (alicePoints / 10n) * 2n,
    );
  });

  it("lets the player reveal their own orb", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await expect(orb.connect(alice).revealOrb(alice.address)).to.emit(
      orb,
      "OrbOpened",
    );
  });
});
