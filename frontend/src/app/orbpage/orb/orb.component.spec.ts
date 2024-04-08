import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideStore } from "@ngxs/store";
import { OrbComponent } from "./orb.component";
import { OrbType } from "../../contract/orb-type";
import { ContractService } from "../../contract/contract.service";
import { WalletService } from "../../wallet/wallet.service";

describe("OrbComponent", () => {
  let fixture: ComponentFixture<OrbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrbComponent],
      providers: [
        provideStore([]),
        {
          provide: ContractService,
          useValue: jasmine.createSpyObj("ContractService", ["lastDailyOpen"]),
        },
        {
          provide: WalletService,
          useValue: { address: () => null, available: false },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrbComponent);
  });

  function render(orbType: OrbType, priceWei: bigint) {
    fixture.componentRef.setInput("orbType", orbType);
    fixture.componentRef.setInput("priceWei", priceWei);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? "";
  }

  it("labels a free orb with open", () => {
    expect(render(OrbType.DAILY, 0n)).toContain("open");
  });

  it("shows the price for a paid orb", () => {
    expect(render(OrbType.GENESIS, 1500000000000000n)).toContain("0.0015 eth");
  });

  it("reacts when the price arrives after first render", () => {
    render(OrbType.QUANTUM, 0n);
    expect(render(OrbType.QUANTUM, 2700000000000000n)).toContain("0.0027 eth");
  });

  it("names the orb", () => {
    expect(render(OrbType.QUANTUM, 0n)).toContain("Quantum");
  });
});
