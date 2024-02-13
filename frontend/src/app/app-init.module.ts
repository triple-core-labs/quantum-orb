import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Store } from '@ngxs/store';
import { SetAddress, SetUsers } from './store/app/app.actions';
import { User } from './interfaces/user';

// functions to generate mock user array
// these functions will be deleted once real data is fetched
// start
function generateRandomString(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function generateUsersArray(count: number): User[] {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const newUser: User = {
      address: generateRandomString(25),
      points: Math.floor(Math.random() * 100),
      parent: '',
    };
    users.push(newUser);
  }
  return users;
}

function assignParents(users: User[]): User[] {
  for (let i = 0; i < users.length; i++) {
    const randomIndex = Math.floor(Math.random() * users.length);
    users[i].parent = users[randomIndex].address;
  }
  return users;
}
// functions to generate mock user array
// these functions will be deleted once real data is fetched
// end

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory(store: Store) {
        return () => {
          console.log('here');

          let generatedUsers = assignParents(generateUsersArray(30));
          let myAddress =
            generatedUsers[Math.floor(Math.random() * generatedUsers.length)]
              .address;
          store.dispatch([
            new SetUsers(generatedUsers),
            new SetAddress(myAddress),
          ]);
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
