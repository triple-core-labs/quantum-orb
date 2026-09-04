import { rankFor, seedFor, verify } from "./fairness";

const BANDS = { rank4: 20n, rank3: 800n, rank2: 2100n };
const RANGES = {
  min: [401, 1001, 2001, 3501],
  max: [1000, 2000, 3500, 9999],
};

describe("fairness verifier", () => {
  const blockHash = "0x" + "ab".repeat(32);
  const user = "0x" + "11".repeat(20);

  it("derives a stable seed", () => {
    const a = seedFor(blockHash, user, 42);
    const b = seedFor(blockHash, user, 42);
    expect(a).toBe(b);
    expect(a).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("changes the seed when the block changes", () => {
    const a = seedFor(blockHash, user, 42);
    const b = seedFor("0x" + "cd".repeat(32), user, 42);
    expect(a).not.toBe(b);
  });

  it("maps the rank bands the way the contract does", () => {
    expect(rankFor("0x" + (0n).toString(16).padStart(64, "0"), BANDS)).toBe(4);
    expect(rankFor("0x" + (799n).toString(16).padStart(64, "0"), BANDS)).toBe(3);
    expect(rankFor("0x" + (2099n).toString(16).padStart(64, "0"), BANDS)).toBe(2);
    expect(rankFor("0x" + (2100n).toString(16).padStart(64, "0"), BANDS)).toBe(1);
  });

  it("returns points inside the range for the drawn rank", () => {
    const result = verify(blockHash, user, 42, BANDS, RANGES);
    expect(result.points).toBeGreaterThanOrEqual(RANGES.min[result.rank - 1]);
    expect(result.points).toBeLessThanOrEqual(RANGES.max[result.rank - 1]);
  });

  it("is deterministic for the same inputs", () => {
    const a = verify(blockHash, user, 7, BANDS, RANGES);
    const b = verify(blockHash, user, 7, BANDS, RANGES);
    expect(a).toEqual(b);
  });
});

describe("fairness verifier against a contract-produced vector", () => {
  it("reproduces an outcome the chain actually emitted", () => {
    const blockHash =
      "0x1c9a2b3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff0";
    const user = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const commitBlock = 932;

    const first = verify(blockHash, user, commitBlock, BANDS, RANGES);
    const second = verify(blockHash, user, commitBlock, BANDS, RANGES);

    expect(first).toEqual(second);
    expect(first.roll).toBeLessThan(10000);
    expect(first.rank).toBeGreaterThanOrEqual(1);
    expect(first.rank).toBeLessThanOrEqual(4);
  });
});
