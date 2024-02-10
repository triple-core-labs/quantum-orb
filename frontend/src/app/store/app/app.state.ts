import { Action, State, StateContext } from '@ngxs/store';
import { AppStateModel } from './app-state.model';
import { Injectable } from '@angular/core';
import { SetAddress, SetUsers } from './app.actions';

@State<AppStateModel>({
  name: 'App',
  defaults: {
    address: '',
    users: [],
  },
})
@Injectable()
export class AppState {
  @Action(SetAddress)
  setAddress(ctx: StateContext<AppStateModel>, { address }: SetAddress) {
    ctx.patchState({ address });
  }

  @Action(SetUsers)
  setUsers(ctx: StateContext<AppStateModel>, { users }: SetUsers) {
    ctx.patchState({ users });
  }
}
