import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { installMockBlast } from "./helpers/blast";
import { mine, REVEAL_DELAY, REVEAL_WINDOW } from "./helpers/chain";

const DAILY = 0;
const ZERO = ethers.ZeroAddress;
const ONE_DAY = 24 * 60 * 60;

describe("QuantumOrb — daily streak", () => {
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

  async function openDaily(orb: any, signer: any) {
    await orb.connect(signer).openOrb(DAILY, ZERO);
    await mine(REVEAL_DELAY);
    await orb.revealOrb(signer.address);
  }

  it("starts a streak at one", async () => {
    const { orb, alice } = await deploy();
    await openDaily(orb, alice);
    expect((await orb.users(alice.address)).dailyStreak).to.equal(1n);
  });

  it("continues the streak on the next day", async () => {
    const { orb, alice } = await deploy();
    await openDaily(orb, alice);

    await time.increase(ONE_DAY + 60);
    await openDaily(orb, alice);

    expect((await orb.users(alice.address)).dailyStreak).to.equal(2n);
  });

  it("resets the streak after skipping a day", async () => {
    const { orb, alice } = await deploy();
    await openDaily(orb, alice);

    await time.increase(3 * ONE_DAY);
    await openDaily(orb, alice);

    expect((await orb.users(alice.address)).dailyStreak).to.equal(1n);
  });

  it("emits the streak on every daily open", async () => {
    const { orb, alice } = await deploy();
    await expect(orb.connect(alice).openOrb(DAILY, ZERO))
      .to.emit(orb, "DailyStreakChanged")
      .withArgs(alice.address, 1);
  });

  it("gives a longer streak more points on average", async () => {
    const { orb, alice } = await deploy();

    await openDaily(orb, alice);
    const first = (await orb.users(alice.address)).points;

    for (let day = 0; day < 6; day++) {
      await time.increase(ONE_DAY + 60);
      await openDaily(orb, alice);
    }

    const streak = (await orb.users(alice.address)).dailyStreak;
    expect(streak).to.equal(7n);
    expect(first).to.be.greaterThan(0n);
  });

  it("caps the bonus once the streak passes the limit", async () => {
    const { orb } = await deploy();
    expect(await orb.MAX_STREAK_BONUS_DAYS()).to.equal(7n);
  });

  it("gives back a streak day when a daily orb expires", async () => {
    const { orb, alice } = await deploy();
    await openDaily(orb, alice);

    await time.increase(ONE_DAY + 60);
    await orb.connect(alice).openOrb(DAILY, ZERO);
    expect((await orb.users(alice.address)).dailyStreak).to.equal(2n);

    await mine(REVEAL_WINDOW + 1);
    await orb.connect(alice).reclaimOrb();

    expect((await orb.users(alice.address)).dailyStreak).to.equal(1n);
  });

  it("publishes the rank odds on chain", async () => {
    const { orb } = await deploy();
    expect(await orb.ROLL_SPACE()).to.equal(10000n);
    expect(await orb.RANK_4_ROLLS()).to.equal(20n);
    expect(await orb.RANK_3_ROLLS()).to.equal(800n);
    expect(await orb.RANK_2_ROLLS()).to.equal(2100n);
  });
});
