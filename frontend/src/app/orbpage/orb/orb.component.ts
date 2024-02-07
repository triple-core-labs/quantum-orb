import { Component, Input } from '@angular/core';

@Component({
  selector: 'orb',
  templateUrl: './orb.component.html',
  styleUrl: './orb.component.scss',
})
export class OrbComponent {
  @Input()
  type: string | undefined;

  @Input()
  price: number = 0;
}
