import { expect } from "chai";
import { ethers } from "hardhat";
import { BLAST_PRECOMPILE, installMockBlast } from "./helpers/blast";

describe("installMockBlast", () => {
  it("puts runtime code at the Blast precompile address", async () => {
    expect(await ethers.provider.getCode(BLAST_PRECOMPILE)).to.equal("0x");

    await installMockBlast();

    expect(await ethers.provider.getCode(BLAST_PRECOMPILE)).to.not.equal("0x");
  });
});
