import { ORB_LABELS, ORB_SLUGS, OrbType, rarityOf } from "./orb-type";

describe("orb types", () => {
  it("mirrors the Solidity enum", () => {
    expect(OrbType.DAILY).toBe(0);
    expect(OrbType.GENESIS).toBe(1);
    expect(OrbType.QUANTUM).toBe(2);
  });

  it("names and slugs every orb", () => {
    for (const type of [OrbType.DAILY, OrbType.GENESIS, OrbType.QUANTUM]) {
      expect(ORB_LABELS[type]).toBeTruthy();
      expect(ORB_SLUGS[type]).toBeTruthy();
    }
  });

  it("names each rank", () => {
    expect(rarityOf(1).name).toBe("Common");
    expect(rarityOf(2).name).toBe("Rare");
    expect(rarityOf(3).name).toBe("Epic");
    expect(rarityOf(4).name).toBe("Legendary");
  });

  it("falls back to common for an unknown rank", () => {
    expect(rarityOf(99).slug).toBe("common");
  });
});
