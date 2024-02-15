import { Selector } from '@ngxs/store';
import { AppState } from './app.state';
import { AppStateModel } from './app-state.model';
import { BigNumber } from 'ethers';
import { from, map, tap } from 'rxjs';

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
      .filter((user) => user.parent === address)
      .sort((a, b) => b.shared_points - a.shared_points);
  }

  @Selector([AppState])
  static points({ points }: AppStateModel) {
    return points;
  }
}
