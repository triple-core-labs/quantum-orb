import { ShortAddressPipe } from "./short-address.pipe";

describe("ShortAddressPipe", () => {
  const pipe = new ShortAddressPipe();

  it("shortens a full address", () => {
    const address = "0x" + "a".repeat(35) + "bcde";
    expect(pipe.transform(address)).toBe("0x...abcde");
  });

  it("returns an empty string for null", () => {
    expect(pipe.transform(null)).toBe("");
  });

  it("returns an empty string for undefined", () => {
    expect(pipe.transform(undefined)).toBe("");
  });

  it("leaves a short value alone", () => {
    expect(pipe.transform("0xabc")).toBe("0xabc");
  });
});
