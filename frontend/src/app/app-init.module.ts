import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Store } from '@ngxs/store';
import { setAddress, setContract, switchChain } from './contract';
import { FetchUsers } from './store/app/app.actions';

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory(store: Store) {
        return () => {
          window.ethereum.on('chainChanged', () => window.location.reload());
          setAddress(store);
          switchChain();
          setContract(store);
          store.dispatch(new FetchUsers());
        };
      },
      multi: true,
      deps: [Store],
    },
  ],
})
export class AppInitializerModule {
  constructor() {}
}
