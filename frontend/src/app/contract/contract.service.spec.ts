import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { Interface, id } from "ethers";
import { ContractService } from "./contract.service";
import { OrbType } from "./orb-type";
import abi from "./quantum-orb.abi.json";

describe("ContractService", () => {
  let service: ContractService;
  const iface = new Interface(abi as never);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContractService);
  });

  function orbOpenedLog(
    user: string,
    rank: number,
    points: number,
    commitBlock = 100,
  ) {
    return iface.encodeEventLog(iface.getEvent("OrbOpened")!, [
      user,
      OrbType.GENESIS,
      rank,
      points,
      commitBlock,
    ]);
  }

  it("decodes rank and points from an OrbOpened log", () => {
    const encoded = orbOpenedLog("0x" + "1".repeat(40), 3, 2750);
    const receipt = { logs: [encoded] } as never;

    expect(service.pointsFromReceipt(receipt)).toEqual({
      rank: 3,
      points: 2750,
    });
  });

  it("ignores logs from other events", () => {
    const receipt = {
      logs: [{ topics: [id("Transfer(address,address,uint256)")], data: "0x" }],
    } as never;

    expect(service.pointsFromReceipt(receipt)).toBeNull();
  });

  it("returns null when the receipt carries no logs", () => {
    expect(service.pointsFromReceipt({ logs: [] } as never)).toBeNull();
  });

  it("finds OrbOpened wherever it sits in the log list", () => {
    const encoded = orbOpenedLog("0x" + "2".repeat(40), 1, 40);
    const receipt = {
      logs: [{ topics: [id("Unrelated()")], data: "0x" }, encoded],
    } as never;

    expect(service.pointsFromReceipt(receipt)?.points).toBe(40);
  });
});
