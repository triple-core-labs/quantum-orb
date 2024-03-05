import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_WINDOW } from "./helpers/chain";

const DAILY = 0;
const GENESIS = 1;
const GENESIS_PRICE = ethers.parseEther("0.0015");

describe("QuantumOrb — failure paths", () => {
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

  async function withReceiver(orb: any, name: string) {
    const Factory = await ethers.getContractFactory(name);
    const receiver = await Factory.deploy(await orb.getAddress());
    await receiver.waitForDeployment();
    return receiver;
  }

  it("unpauses and allows opening again", async () => {
    const { orb, alice } = await deploy();
    await orb.pause();
    await expect(
      orb.connect(alice).openOrb(DAILY, ethers.ZeroAddress),
    ).to.be.revertedWithCustomError(orb, "EnforcedPause");

    await orb.unpause();
    await expect(
      orb.connect(alice).openOrb(DAILY, ethers.ZeroAddress),
    ).to.emit(orb, "OrbCommitted");
  });

  it("rejects pause and unpause from a non-owner", async () => {
    const { orb, alice } = await deploy();
    await expect(
      orb.connect(alice).pause(),
    ).to.be.revertedWithCustomError(orb, "OwnableUnauthorizedAccount");
    await orb.pause();
    await expect(
      orb.connect(alice).unpause(),
    ).to.be.revertedWithCustomError(orb, "OwnableUnauthorizedAccount");
  });

  it("surfaces a refused refund as TransferFailed", async () => {
    const { orb } = await deploy();
    const receiver = await withReceiver(orb, "RejectingReceiver");

    await receiver.open(GENESIS, { value: GENESIS_PRICE });
    await mine(REVEAL_WINDOW + 1);

    await expect(receiver.reclaim()).to.be.revertedWithCustomError(
      orb,
      "TransferFailed",
    );
  });

  it("surfaces a refused withdrawal as TransferFailed", async () => {
    const { orb, alice } = await deploy();
    const receiver = await withReceiver(orb, "RejectingReceiver");

    await orb
      .connect(alice)
      .openOrb(GENESIS, ethers.ZeroAddress, { value: GENESIS_PRICE });

    await expect(
      orb.withdraw(await receiver.getAddress(), GENESIS_PRICE),
    ).to.be.revertedWithCustomError(orb, "TransferFailed");
  });

  it("blocks a re-entrant reclaim", async () => {
    const { orb } = await deploy();
    const receiver = await withReceiver(orb, "ReentrantReceiver");

    await receiver.open(GENESIS, { value: GENESIS_PRICE });
    await mine(REVEAL_WINDOW + 1);

    // The guard reverts the inner call, which makes the outer refund transfer
    // fail; the payment stays with the contract rather than being paid twice.
    await expect(receiver.reclaim()).to.be.revertedWithCustomError(
      orb,
      "TransferFailed",
    );
    expect(await ethers.provider.getBalance(await orb.getAddress())).to.equal(
      GENESIS_PRICE,
    );
  });
});
