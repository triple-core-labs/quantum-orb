import { Action, State, StateContext, Store } from '@ngxs/store';
import { AppStateModel } from './app-state.model';
import { Injectable, NgZone } from '@angular/core';
import {
  FetchUsers,
  GetLastOpenedDaily,
  GetPoints,
  OpenDailyOrb,
  OpenGenesisOrb,
  OpenQuantumOrb,
  SetAddress,
  SetContract,
} from './app.actions';
import { BigNumber, ethers } from 'ethers';
import { MatDialog } from '@angular/material/dialog';
import { UnboxingDialogComponent } from '../../orbpage/unboxing-dialog/unboxing-dialog.component';
import { HttpClient } from '@angular/common/http';
import { User } from '../../interfaces/user';

@State<AppStateModel>({
  name: 'App',
  defaults: {
    address: null,
    points: 0,
    lastOpenedDaily: null,
    contract: null,
    users: [],
  },
})
@Injectable()
export class AppState {
  constructor(
    private store: Store,
    private dialog: MatDialog,
    private zone: NgZone,
    private http: HttpClient
  ) {}

  @Action(SetAddress)
  setAddress(ctx: StateContext<AppStateModel>, { address }: SetAddress) {
    ctx.patchState({ address });
    this.store.dispatch([
      new GetPoints(),
      new GetLastOpenedDaily(),
      new FetchUsers(),
    ]);
  }

  @Action(FetchUsers)
  fetchUsers(ctx: StateContext<AppStateModel>) {
    this.http
      .get<User[]>('https://quantum-orb.up.railway.app/blastaddress/')
      .subscribe((response) => ctx.patchState({ users: response }));
  }

  @Action(SetContract)
  async setContract(
    ctx: StateContext<AppStateModel>,
    { contract }: SetContract
  ) {
    ctx.patchState({ contract });
    this.store.dispatch([
      new GetPoints(),
      new GetLastOpenedDaily(),
      new FetchUsers(),
    ]);
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
      this.zone.run(() => {
        this.dialog.open(UnboxingDialogComponent, {
          disableClose: true,
          panelClass: 'orb-dialog',
          data: response,
        });
      });
    });
  }

  @Action(OpenGenesisOrb)
  async openGenesisOrb(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    if (!state.address || !state.contract) return;
    await state.contract['openGenesisOrb']({
      value: ethers.utils.parseEther('0.0015'),
    }).then((response: any) => {
      this.zone.run(() => {
        this.dialog.open(UnboxingDialogComponent, {
          disableClose: true,
          panelClass: 'orb-dialog',
          data: response,
        });
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
      this.zone.run(() => {
        this.dialog.open(UnboxingDialogComponent, {
          disableClose: true,
          panelClass: 'orb-dialog',
          data: response,
        });
      });
    });
  }

  @Action(GetLastOpenedDaily)
  async getLastOpenedDaily(ctx: StateContext<AppStateModel>) {
    const state = ctx.getState();
    if (!state.address || !state.contract) return;
    await state.contract['getUserLastOpenedDaily'](state.address).then(
      (response: any) => {
        const timestamp = response.toNumber();
        ctx.patchState({ lastOpenedDaily: new Date(timestamp * 1000) });
      }
    );
  }
}
