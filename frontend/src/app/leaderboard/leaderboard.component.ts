import { Component, HostListener, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { Select } from '@ngxs/store';
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

  constructor() {}

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
  }
}
export { User };
