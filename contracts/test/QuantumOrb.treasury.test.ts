import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { installMockBlast } from "./helpers/blast";

const GENESIS = 1;
const ZERO = ethers.ZeroAddress;
const GENESIS_PRICE = ethers.parseEther("0.0015");

describe("QuantumOrb — treasury", () => {
  async function deploy() {
    await installMockBlast();
    const [owner, alice, treasury] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("QuantumOrb");
    const orb = await upgrades.deployProxy(Factory, [], {
      initializer: "initialize",
    });
    await orb.waitForDeployment();
    return { orb, owner, alice, treasury };
  }

  it("accumulates orb payments", async () => {
    const { orb, alice } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });
    expect(await ethers.provider.getBalance(await orb.getAddress())).to.equal(
      GENESIS_PRICE,
    );
  });

  it("withdraws to an arbitrary recipient", async () => {
    const { orb, alice, treasury } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });

    await expect(
      orb.withdraw(treasury.address, GENESIS_PRICE),
    ).to.changeEtherBalance(treasury, GENESIS_PRICE);
  });

  it("emits Withdrawn", async () => {
    const { orb, alice, treasury } = await deploy();
    await orb.connect(alice).openOrb(GENESIS, ZERO, { value: GENESIS_PRICE });

    await expect(orb.withdraw(treasury.address, GENESIS_PRICE))
      .to.emit(orb, "Withdrawn")
      .withArgs(treasury.address, GENESIS_PRICE);
  });

  it("rejects withdrawal from a non-owner", async () => {
    const { orb, alice } = await deploy();
    await expect(
      orb.connect(alice).withdraw(alice.address, 1n),
    ).to.be.revertedWithCustomError(orb, "OwnableUnauthorizedAccount");
  });

  it("rejects withdrawing more than the balance", async () => {
    const { orb, treasury } = await deploy();
    await expect(
      orb.withdraw(treasury.address, 1n),
    ).to.be.revertedWithCustomError(orb, "InsufficientBalance");
  });

  it("accepts plain ETH transfers", async () => {
    const { orb, alice } = await deploy();
    await expect(
      alice.sendTransaction({
        to: await orb.getAddress(),
        value: ethers.parseEther("0.01"),
      }),
    ).to.not.be.reverted;
  });

  it("lets only the owner claim Blast gas refunds", async () => {
    const { orb, alice } = await deploy();
    await expect(orb.claimGas()).to.not.be.reverted;
    await expect(
      orb.connect(alice).claimGas(),
    ).to.be.revertedWithCustomError(orb, "OwnableUnauthorizedAccount");
  });

  it("hands ownership over in two steps", async () => {
    const { orb, owner, treasury } = await deploy();
    await orb.transferOwnership(treasury.address);
    expect(await orb.owner()).to.equal(owner.address);

    await orb.connect(treasury).acceptOwnership();
    expect(await orb.owner()).to.equal(treasury.address);
  });
});
