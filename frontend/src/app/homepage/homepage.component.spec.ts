import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Subject, of } from "rxjs";
import { HomepageComponent } from "./homepage.component";
import { ApiService } from "../api/api.service";
import { ChainConfig } from "../api/api.types";

describe("HomepageComponent", () => {
  let fixture: ComponentFixture<HomepageComponent>;
  let config: Subject<ChainConfig>;

  beforeEach(async () => {
    config = new Subject<ChainConfig>();
    const api = jasmine.createSpyObj("ApiService", [
      "config",
      "activity",
      "stats",
    ]);
    api.config.and.returnValue(config);
    api.activity.and.returnValue(of({ opens: [] }));
    api.stats.and.returnValue(
      of({ players: 0, orbsOpened: 0, pointsAwarded: 0, biggestOpen: 0 }),
    );

    await TestBed.configureTestingModule({
      imports: [HomepageComponent],
      providers: [provideRouter([]), { provide: ApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    fixture.detectChanges();
  });

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? "";
  }

  it("sends the opening call to action to the orbs", () => {
    const cta = (fixture.nativeElement as HTMLElement).querySelector("a");
    expect(cta?.getAttribute("href")).toBe("/orbs");
  });

  it("holds the price column until the prices arrive", () => {
    expect(text()).toContain("—");
  });

  it("shows the prices once they arrive", () => {
    config.next({
      chainId: 31337,
      contractAddress: "0x0",
      rpcUrl: "http://localhost:8545",
      confirmations: 1,
      orbs: {
        "1": { price: "1500000000000000", enabled: true },
        "2": { price: "2700000000000000", enabled: true },
      },
      pointRanges: {
        "1": { min: [401, 1001, 2001, 3501], max: [1000, 2000, 3500, 9999] },
      },
    });
    fixture.detectChanges();

    expect(text()).toContain("0.0015 ETH");
    expect(text()).toContain("0.0027 ETH");
  });

  it("quotes the point range the contract publishes", () => {
    config.next({
      chainId: 31337,
      contractAddress: "0x0",
      rpcUrl: "http://localhost:8545",
      confirmations: 1,
      pointRanges: {
        "1": { min: [401, 1001, 2001, 3501], max: [1000, 2000, 3500, 9999] },
      },
    });
    fixture.detectChanges();

    expect(text()).toContain("401 – 9,999 points");
  });

  it("no longer carries the FAQ", () => {
    expect(text()).not.toContain("What is Quantum Orb?");
  });
});
