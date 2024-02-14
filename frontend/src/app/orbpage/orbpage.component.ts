import { Component } from '@angular/core';
import { OrbComponent } from './orb/orb.component';

@Component({
  selector: 'orbpage',
  templateUrl: './orbpage.component.html',
  styleUrl: './orbpage.component.scss',
  standalone: true,
  imports: [OrbComponent],
})
export class OrbpageComponent {}
