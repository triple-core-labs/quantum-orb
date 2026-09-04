import { TestBed } from "@angular/core/testing";
import { Store, provideStore } from "@ngxs/store";
import { Observable, of } from "rxjs";
import { AppState } from "./app.state";
import { OpenOrb, ReclaimOrb, RestoreSession } from "./app.actions";
import { AppSelectors } from "./app.selectors";
import { ApiService } from "../../api/api.service";
import { ContractService } from "../../contract/contract.service";
import { WalletService } from "../../wallet/wallet.service";
import { OrbType } from "../../contract/orb-type";

function settled(dispatched: Observable<unknown>): Promise<void> {
  return new Promise((resolve) => dispatched.subscribe(() => resolve()));
}

describe("AppState", () => {
  let store: Store;
  let contract: jasmine.SpyObj<ContractService>;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    contract = jasmine.createSpyObj("ContractService", [
      "openOrb",
      "reclaimOrb",
      "pointsFromReceipt",
    ]);
    api = jasmine.createSpyObj("ApiService", [
      "leaderboard",
      "pending",
      "referrals",
    ]);
    const wallet = jasmine.createSpyObj("WalletService", ["connect", "restore"]);

    api.leaderboard.and.returnValue(of({ top: [], around: [] }));
    api.pending.and.returnValue(of({ pending: null }));
    api.referrals.and.returnValue(of({ count: 0, referrals: [] }));

    TestBed.configureTestingModule({
      providers: [
        provideStore([AppState]),
        { provide: ContractService, useValue: contract },
        { provide: ApiService, useValue: api },
        { provide: WalletService, useValue: wallet },
      ],
    });
    store = TestBed.inject(Store);
  });

  it("starts idle", () => {
    expect(store.selectSnapshot(AppSelectors.orbStatus).kind).toBe("idle");
  });

  it("moves to revealed with the decoded outcome", async () => {
    contract.openOrb.and.resolveTo({ logs: [] } as never);
    contract.pointsFromReceipt.and.returnValue({ rank: 2, points: 1500 });

    await settled(store.dispatch(new OpenOrb(OrbType.GENESIS, 1500n)));

    const status = store.selectSnapshot(AppSelectors.orbStatus);
    expect(status.kind).toBe("revealed");
    expect((status as { points: number }).points).toBe(1500);
  });

  it("stays committed when the receipt carries no outcome", async () => {
    contract.openOrb.and.resolveTo({ logs: [], blockNumber: 77 } as never);
    contract.pointsFromReceipt.and.returnValue(null);

    await settled(store.dispatch(new OpenOrb(OrbType.DAILY, 0n)));

    const status = store.selectSnapshot(AppSelectors.orbStatus);
    expect(status.kind).toBe("committed");
    expect((status as { commitBlock: number }).commitBlock).toBe(77);
  });

  it("reports a rejected signature in plain words", async () => {
    contract.openOrb.and.rejectWith({ code: 4001 });

    await settled(store.dispatch(new OpenOrb(OrbType.DAILY, 0n)));

    const status = store.selectSnapshot(AppSelectors.orbStatus);
    expect(status.kind).toBe("error");
    expect((status as { message: string }).message).toContain("rejected");
  });

  it("restores a pending orb into the committed state", async () => {
    api.pending.and.returnValue(
      of({ pending: { orbType: OrbType.QUANTUM, commitBlock: 42 } }),
    );

    await settled(store.dispatch(new RestoreSession("0xabc")));

    const status = store.selectSnapshot(AppSelectors.orbStatus);
    expect(status.kind).toBe("committed");
    expect((status as { commitBlock: number }).commitBlock).toBe(42);
  });

  it("leaves the status idle when there is nothing pending", async () => {
    await settled(store.dispatch(new RestoreSession("0xabc")));
    expect(store.selectSnapshot(AppSelectors.orbStatus).kind).toBe("idle");
  });

  it("returns to idle after a reclaim", async () => {
    contract.reclaimOrb.and.resolveTo({ logs: [] } as never);
    await settled(store.dispatch(new ReclaimOrb()));
    expect(store.selectSnapshot(AppSelectors.orbStatus).kind).toBe("idle");
  });

  it("loads the leaderboard for the restored address", async () => {
    await settled(store.dispatch(new RestoreSession("0xabc")));
    expect(api.leaderboard).toHaveBeenCalledWith("0xabc");
  });
});
