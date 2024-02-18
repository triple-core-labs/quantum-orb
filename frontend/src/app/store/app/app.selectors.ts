import { Selector } from '@ngxs/store';
import { AppState } from './app.state';
import { AppStateModel } from './app-state.model';
import { BigNumber } from 'ethers';
import { from, map, tap } from 'rxjs';
import { add, differenceInSeconds } from 'date-fns';

export class AppSelectors {
  @Selector([AppState])
  static address({ address }: AppStateModel) {
    return address;
  }

  @Selector([AppState])
  static users({ users }: AppStateModel) {
    return users.sort((a, b) => b.points - a.points);
  }

  @Selector([AppState])
  static referrals({ address, users }: AppStateModel) {
    return users
      .filter((user) => user.parent === users.at(users.length - 1)?.address)
      .sort((a, b) => b.shared_points - a.shared_points);
  }

  @Selector([AppState])
  static points({ points }: AppStateModel) {
    return points;
  }

  @Selector([AppState])
  static lastOpenedDailyDate({ lastOpenedDaily }: AppStateModel) {
    return lastOpenedDaily;
  }
}
