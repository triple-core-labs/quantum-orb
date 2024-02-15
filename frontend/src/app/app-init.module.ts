import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Store } from '@ngxs/store';
import { setAddress, switchChain } from './contract';

// functions to generate mock user array
// these functions will be deleted once real data is fetched
// start
// function generateRandomString(length: number): string {
//   const characters =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

// function generateUsersArray(count: number): User[] {
//   const users: User[] = [];
//   for (let i = 0; i < count; i++) {
//     const newUser: User = {
//       address: generateRandomString(25),
//       points: Math.floor(Math.random() * 100),
//       parent: '',
//       shared_points: Math.floor(Math.random() * 100),
//     };
//     users.push(newUser);
//   }
//   return users;
// }

// function assignParents(users: User[]): User[] {
//   for (let i = 0; i < users.length; i++) {
//     const randomIndex = Math.floor(Math.random() * users.length);
//     users[i].parent = users[randomIndex].address;
//   }
//   return users;
// }
// functions to generate mock user array
// these functions will be deleted once real data is fetched
// end

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory(store: Store) {
        return () => {
          window.ethereum.on('chainChanged', (chainId) =>
            window.location.reload()
          );
          if (window.ethereum.isConnected()) {
            setAddress(store);
            switchChain();
          }
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
