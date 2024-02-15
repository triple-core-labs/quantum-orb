import { Component, ElementRef } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { AppSelectors } from '../store/app/app.selectors';
import { Observable } from 'rxjs';
import { getAccount } from '../contract';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Select(AppSelectors.address)
  address$!: Observable<string>;

  constructor(private elRef: ElementRef, private store: Store) {}

  toggleMenu(): void {
    this.elRef.nativeElement.classList.toggle('active');
  }

  connectWallet(): void {
    getAccount(this.store);
  }
}
