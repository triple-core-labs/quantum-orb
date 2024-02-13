import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { Select, Store } from '@ngxs/store';
import { SetAddress, SetUsers } from '../store/app/app.actions';
import { AppSelectors } from '../store/app/app.selectors';
import { Observable } from 'rxjs';
import { ShortAddressPipe } from '../pipes/short-address.pipe';
import { InvitationsAmountPipe } from '../pipes/invitations-amount.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss',
  standalone: true,
  imports: [ShortAddressPipe, InvitationsAmountPipe, CommonModule],
})
export class LeaderboardComponent implements OnInit {
  @Select(AppSelectors.users)
  users$!: Observable<User[]>;

  @Select(AppSelectors.address)
  address$!: Observable<string>;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }

  innerWidth: number = 0;

  constructor(private store: Store) {}

  // functions to generate mock user array
  // these functions will be deleted once real data is fetched
  // start
  generateRandomString(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateUsersArray(count: number): User[] {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const newUser: User = {
        address: this.generateRandomString(25),
        points: Math.floor(Math.random() * 100),
        parent: '',
      };
      users.push(newUser);
    }
    return users;
  }

  assignParents(users: User[]): User[] {
    for (let i = 0; i < users.length; i++) {
      const randomIndex = Math.floor(Math.random() * users.length);
      users[i].parent = users[randomIndex].address;
    }
    return users;
  }
  // functions to generate mock user array
  // these functions will be deleted once real data is fetched
  // end

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    let generatedUsers = this.assignParents(this.generateUsersArray(30));
    let myAddress =
      generatedUsers[Math.floor(Math.random() * generatedUsers.length)].address;
    this.store.dispatch(new SetUsers(generatedUsers));
    this.store.dispatch(new SetAddress(myAddress));
  }
}
export { User };
