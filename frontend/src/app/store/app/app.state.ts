import { Action, State, StateContext, Store } from '@ngxs/store';
import { AppStateModel } from './app-state.model';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  GetPoints,
  OpenDailyOrb,
  OpenGenesisOrb,
  OpenQuantumOrb,
  SetAddress,
  SetContract,
  SetUsers,
} from './app.actions';
import { BigNumber, ethers } from 'ethers';

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
  constructor(private store: Store, private snackbar: MatSnackBar) {}

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

  @Action(OpenDailyOrb)
  async openDailyOrb(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    if (!state.address || !state.contract) return;
    await state.contract['openDailyOrb']().then((response: any) => {
      // response.events[0].args['pointsEarned'].toNumber();
      this.store.dispatch(new GetPoints());
    });
  }

  @Action(OpenGenesisOrb)
  async openGenesisOrb(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    if (!state.address || !state.contract) return;
    await state.contract['openGenesisOrb']({
      value: ethers.utils.parseEther('0.0015'),
    }).then((response: any) => {
      response.wait().then((response: any) => {
        // response.events[0].args['pointsEarned'].toNumber();
        this.store.dispatch(new GetPoints());
      });
    });
  }

  @Action(OpenQuantumOrb)
  async openQuantumOrb(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    if (!state.address || !state.contract) return;
    await state.contract['openQuantumOrb']({
      value: ethers.utils.parseEther('0.0027'),
    }).then((response: any) => {
      response.wait().then((response: any) => {
        // response.events[0].args['pointsEarned'].toNumber();
        this.store.dispatch(new GetPoints());
      });
    });
  }
}
