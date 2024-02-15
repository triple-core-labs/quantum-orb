import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private elRef: ElementRef) {}

  toggleMenu(): void {
    this.elRef.nativeElement.classList.toggle('active');
  }
}
