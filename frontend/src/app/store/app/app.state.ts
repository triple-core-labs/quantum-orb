import { Injectable, inject } from "@angular/core";
import { Action, State, StateContext } from "@ngxs/store";
import { catchError, firstValueFrom, of } from "rxjs";
import { ApiService } from "../../api/api.service";
import { ContractService } from "../../contract/contract.service";
import { WalletService } from "../../wallet/wallet.service";
import { ReferralLinkService } from "../../referrals/referral-link.service";
import { AppStateModel } from "./app-state.model";
import {
  Connect,
  DismissOutcome,
  LoadLeaderboard,
  LoadReferrals,
  OpenOrb,
  ReclaimOrb,
  RestoreSession,
} from "./app.actions";

const INITIAL: AppStateModel = {
  address: null,
  orbStatus: { kind: "idle" },
  leaderboard: [],
  around: [],
  referrals: [],
  referralCount: 0,
  points: 0,
};

function readableError(error: unknown): string {
  const code = (error as { code?: string | number }).code;
  if (code === "ACTION_REJECTED" || code === 4001) {
    return "You rejected the transaction.";
  }
  return (error as Error).message || "Something went wrong.";
}

@State<AppStateModel>({ name: "app", defaults: INITIAL })
@Injectable()
export class AppState {
  private readonly wallet = inject(WalletService);
  private readonly contract = inject(ContractService);
  private readonly api = inject(ApiService);
  private readonly referralLink = inject(ReferralLinkService);

  @Action(Connect)
  async connect(ctx: StateContext<AppStateModel>) {
    const address = await this.wallet.connect();
    if (!address) return;
    await this.restoreSession(ctx, new RestoreSession(address));
  }

  @Action(RestoreSession)
  async restoreSession(
    ctx: StateContext<AppStateModel>,
    { address }: RestoreSession,
  ) {
    ctx.patchState({ address });

    const [pending, board, referrals, points] = await Promise.all([
      firstValueFrom(this.api.pending(address)),
      firstValueFrom(this.api.leaderboard(address)),
      firstValueFrom(this.api.referrals(address)),
      this.pointsOf(address),
    ]);

    ctx.patchState({
      leaderboard: board.top,
      around: board.around,
      referrals: referrals.referrals,
      referralCount: referrals.count,
      points,
      orbStatus: pending.pending
        ? {
            kind: "committed",
            orbType: pending.pending.orbType,
            commitBlock: pending.pending.commitBlock,
          }
        : { kind: "idle" },
    });
  }

  @Action(OpenOrb)
  async openOrb(
    ctx: StateContext<AppStateModel>,
    { orbType, priceWei }: OpenOrb,
  ) {
    ctx.patchState({ orbStatus: { kind: "awaiting_signature", orbType } });

    try {
      const receipt = await this.contract.openOrb(
        orbType,
        this.referralLink.stored(),
        priceWei,
      );
      const outcome = this.contract.pointsFromReceipt(receipt);

      ctx.patchState({
        orbStatus: outcome
          ? {
              kind: "revealed",
              orbType,
              rank: outcome.rank,
              points: outcome.points,
            }
          : { kind: "committed", orbType, commitBlock: receipt.blockNumber },
        points: outcome
          ? ctx.getState().points + outcome.points
          : ctx.getState().points,
      });
    } catch (error) {
      ctx.patchState({
        orbStatus: { kind: "error", message: readableError(error) },
      });
    }
  }

  @Action(ReclaimOrb)
  async reclaimOrb(ctx: StateContext<AppStateModel>) {
    try {
      await this.contract.reclaimOrb();
      ctx.patchState({ orbStatus: { kind: "idle" } });
    } catch (error) {
      ctx.patchState({
        orbStatus: { kind: "error", message: readableError(error) },
      });
    }
  }

  @Action(DismissOutcome)
  dismiss(ctx: StateContext<AppStateModel>) {
    ctx.patchState({ orbStatus: { kind: "idle" } });
  }

  @Action(LoadLeaderboard)
  async loadLeaderboard(ctx: StateContext<AppStateModel>) {
    const address = ctx.getState().address ?? undefined;
    const board = await firstValueFrom(this.api.leaderboard(address));
    ctx.patchState({ leaderboard: board.top, around: board.around });

    if (address) ctx.patchState({ points: await this.pointsOf(address) });
  }

  private async pointsOf(address: string): Promise<number> {
    const player = await firstValueFrom(
      this.api.player(address).pipe(catchError(() => of(null))),
    );
    return player?.points ?? 0;
  }

  @Action(LoadReferrals)
  async loadReferrals(ctx: StateContext<AppStateModel>) {
    const address = ctx.getState().address;
    if (!address) return;
    const referrals = await firstValueFrom(this.api.referrals(address));
    ctx.patchState({
      referrals: referrals.referrals,
      referralCount: referrals.count,
    });
  }
}
