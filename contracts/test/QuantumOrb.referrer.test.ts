import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_DELAY } from "./helpers/chain";

const DAILY = 0;
const ZERO = ethers.ZeroAddress;

describe("QuantumOrb — referrer binding", () => {
  async function deploy() {
    await installMockBlast();
    const [owner, alice, bob, carol] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("QuantumOrb");
    const orb = await upgrades.deployProxy(Factory, [], {
      initializer: "initialize",
    });
    await orb.waitForDeployment();
    return { orb, owner, alice, bob, carol };
  }

  it("binds a referrer on first open", async () => {
    const { orb, alice, bob } = await deploy();
    await orb.connect(alice).openOrb(DAILY, bob.address);
    expect((await orb.users(alice.address)).referrer).to.equal(bob.address);
  });

  it("rejects naming yourself", async () => {
    const { orb, alice } = await deploy();
    await expect(
      orb.connect(alice).openOrb(DAILY, alice.address),
    ).to.be.revertedWithCustomError(orb, "InvalidReferrer");
  });

  it("rejects a two-party loop", async () => {
    const { orb, alice, bob } = await deploy();
    await orb.connect(alice).openOrb(DAILY, bob.address);
    await expect(
      orb.connect(bob).openOrb(DAILY, alice.address),
    ).to.be.revertedWithCustomError(orb, "InvalidReferrer");
  });

  it("keeps the referrer immutable across later opens", async () => {
    const { orb, alice, bob, carol } = await deploy();
    await orb.connect(alice).openOrb(DAILY, bob.address);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(alice.address);

    await time.increase(24 * 60 * 60);
    await orb.connect(alice).openOrb(DAILY, carol.address);

    expect((await orb.users(alice.address)).referrer).to.equal(bob.address);
  });

  it("allows no referrer", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    expect((await orb.users(alice.address)).referrer).to.equal(ZERO);
  });

  it("allows a three-party chain", async () => {
    const { orb, alice, bob, carol } = await deploy();
    await orb.connect(alice).openOrb(DAILY, ZERO);
    await orb.connect(bob).openOrb(DAILY, alice.address);
    await orb.connect(carol).openOrb(DAILY, bob.address);

    expect((await orb.users(carol.address)).referrer).to.equal(bob.address);
  });
});
