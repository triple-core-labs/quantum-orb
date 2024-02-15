import { Action, State, StateContext, Store } from '@ngxs/store';
import { AppStateModel } from './app-state.model';
import { Injectable } from '@angular/core';
import { GetPoints, SetAddress, SetContract, SetUsers } from './app.actions';
import { BigNumber } from 'ethers';

@State<AppStateModel>({
  name: 'App',
  defaults: {
    address: null,
    points: 0,
    contract: null,
    users: [],
  },
})
@Injectable()
export class AppState {
  constructor(private store: Store) {}

  @Action(SetAddress)
  setAddress(ctx: StateContext<AppStateModel>, { address }: SetAddress) {
    ctx.patchState({ address });
    this.store.dispatch(new GetPoints());
  }

  @Action(SetUsers)
  setUsers(ctx: StateContext<AppStateModel>, { users }: SetUsers) {
    ctx.patchState({ users });
  }

  @Action(SetContract)
  async setContract(
    ctx: StateContext<AppStateModel>,
    { contract }: SetContract
  ) {
    ctx.patchState({ contract });
    this.store.dispatch(new GetPoints());
  }

  @Action(GetPoints)
  async getPoints(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    if (!state.address || !state.contract) return;
    await state.contract['getPoints'](state.address).then(
      (response: BigNumber) => ctx.patchState({ points: response.toNumber() })
    );
  }
}
