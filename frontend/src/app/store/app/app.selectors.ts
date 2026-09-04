import { Selector } from "@ngxs/store";
import { AppState } from "./app.state";
import { AppStateModel } from "./app-state.model";

export class AppSelectors {
  @Selector([AppState])
  static address({ address }: AppStateModel) {
    return address;
  }

  @Selector([AppState])
  static orbStatus({ orbStatus }: AppStateModel) {
    return orbStatus;
  }

  @Selector([AppState])
  static leaderboard({ leaderboard }: AppStateModel) {
    return leaderboard;
  }

  @Selector([AppState])
  static around({ around }: AppStateModel) {
    return around;
  }

  @Selector([AppState])
  static referrals({ referrals }: AppStateModel) {
    return referrals;
  }

  @Selector([AppState])
  static referralCount({ referralCount }: AppStateModel) {
    return referralCount;
  }

  @Selector([AppState])
  static points({ points }: AppStateModel) {
    return points;
  }
}
