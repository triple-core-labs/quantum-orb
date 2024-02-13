import { Component, HostListener, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { AppSelectors } from '../store/app/app.selectors';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { CommonModule } from '@angular/common';
import { ShortAddressPipe } from '../pipes/short-address.pipe';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss',
  standalone: true,
  imports: [CommonModule, ShortAddressPipe],
})
export class ReferralsComponent implements OnInit {
  @Select(AppSelectors.referrals)
  referrals$!: Observable<User[]>;

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
