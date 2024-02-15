import { Component, DestroyRef, ElementRef, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AppSelectors } from '../store/app/app.selectors';
import { Observable, subscribeOn } from 'rxjs';
import { getAccount } from '../contract';
import { BigNumber } from 'ethers';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Select(AppSelectors.address)
  address$!: Observable<string | null>;

  @Select(AppSelectors.points)
  points$!: Observable<number>;

  points: number = 0;

  constructor(
    private elRef: ElementRef,
    private store: Store,
    private destroyRef: DestroyRef
  ) {}

  toggleMenu(): void {
    this.elRef.nativeElement.classList.toggle('active');
  }

  connectWallet(): void {
    getAccount(this.store);
  }
}
